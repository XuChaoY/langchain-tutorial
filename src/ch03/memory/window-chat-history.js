import { ChatMessageHistory } from '@langchain/community/stores/message/in_memory'

export class WindowChatHistory extends ChatMessageHistory {
  constructor({maxMessages = 5}) {
    super()
    this.maxMessages = maxMessages
  }

  async addMessage(message) {
    await super.addMessage(message)
    const messages = await this.getMessages()
    if (messages.length > this.maxMessages) {
      // remove the oldest message
      const excess = messages.length - this.maxMessages
      messages.splice(0, excess)
      this.messages = messages;
    }
  }
}

