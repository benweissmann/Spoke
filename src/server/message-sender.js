import { sendMessage, saveNewIncomingMessage, convertMessagePartsToMessage } from './api/lib/nexmo'
import { r } from './models'
import { log } from '../lib'

async function sleep(ms = 0) {
  return new Promise(fn => setTimeout(fn, ms))
}

async function sendMessages() {
  const messages = await r.table('message')
    .getAll('QUEUED', { index: 'send_status' })
    .group('user_number')
    .orderBy('created_at')
    .limit(1)(0)
  for (let index = 0; index < messages.length; index++) {
    log.info('sending message', messages[index].reduction)
    await sendMessage(messages[index].reduction)
  }
}

async function handlePendingIncomingMessageParts() {
  const allParts = await r.table('pending_message_part')
  const messagesToSave = []
  let messagePartsToDelete = []
  const concatMessageParts = {}

  const allPartsCount = allParts.length

  for (let i = 0; i < allPartsCount; i++) {
    const part = allParts[i]
    const serviceMessageId = part.service_message.messageId
    const savedCount = await r.table('message')
      .getAll(serviceMessageId, { index: 'service_message_ids' })
      .count()

    const duplicateMessageToSaveExists = !!messagesToSave.find((message) => message.service_message_ids.indexOf(serviceMessageId) !== -1 )
    if (savedCount > 0) {
      log.info(`Found already saved message matching part service message ID ${part.service_message.messageId}`)
      messagePartsToDelete.push(part)
    } else if (duplicateMessageToSaveExists) {
      log.info(`Found duplicate message to be saved matching part service message ID ${part.service_message.messageId}`)
      messagePartsToDelete.push(part)
    } else {
      const parentId = part.parent_id
      if (parentId === '') {
        messagesToSave.push(await convertMessagePartsToMessage([part]))
        messagePartsToDelete.push(part)
      } else {
        const groupKey = [parentId, part.contact_number, part.user_number]

        if (!concatMessageParts.hasOwnProperty(groupKey)){
          const partCount = parseInt(part.service_message['concat-total'], 10)
          concatMessageParts[groupKey] = Array(partCount).fill(null)
        }

        const partIndex = parseInt(part.service_message['concat-part'], 10) - 1
        if (concatMessageParts[groupKey][partIndex] !== null) {
          messagePartsToDelete.push(part)
        } else {
          concatMessageParts[groupKey][partIndex] = part
        }
      }
    }
  }

  const keys = Object.keys(concatMessageParts)
  const keyCount = keys.length

  for (let i = 0; i < keyCount; i++) {
    const groupKey = keys[i]
    const messageParts = concatMessageParts[groupKey]

    if (messageParts.filter((part) => part === null).length === 0) {
      messagePartsToDelete = messagePartsToDelete.concat(messageParts)
      const message = await convertMessagePartsToMessage(messageParts)
      messagesToSave.push(message)
    } else {
      log.debug("Not all message parts for ${groupKey} have arrived")
    }
  }

  const messageCount = messagesToSave.length
  for (let i = 0; i < messageCount; i++) {
    log.info("Saving message with service message IDs", messagesToSave[i].service_message_ids)
    await saveNewIncomingMessage(messagesToSave[i])
  }

  const messagePartsToDeleteCount = messagePartsToDelete.length
  for (let i = 0; i < messagePartsToDeleteCount; i++) {
    log.info("Deleting message part", messagePartsToDelete[i].id)
    await r.table('pending_message_part')
      .get(messagePartsToDelete[i].id)
      .delete()
  }
}
(async () => {
  while (true) {
    try {
      await sleep(1100)
      await sendMessages()
      await handlePendingIncomingMessageParts()
    } catch (ex) {
      log.error(ex)
    }
  }
})()