const amqplib = require('amqplib')

module.exports = (db) => {
  const service = {}

  service.consumeEmail = async () => { 
    const client = await amqplib.connect(process.env.CLOUDAMQP_URL)
    const channel = await client.createChannel()
    await channel.assertQueue(process.env.QUEUE)
    channel.consume(process.env.QUEUE, async (msg) => {
      const data = JSON.parse(msg.content)
      //   console.log('data ->',data)
      try {
        const insertAccess = await db.insertAccessUser({author_id:data.author_id, todo_id:data.todo_id,role:data.role}) 

        console.log('Insert access',insertAccess)
        channel.ack(msg)
      } catch (error) {
        console.log(error)
      }
    })
  }

  return service
}