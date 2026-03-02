import { ChatMessageHistory } from '@langchain/community/stores/message/in_memory';
import { SystemMessage } from '@langchain/core/messages'

export class HybridChatHistory extends ChatMessageHistory {
  constructor({llm, windowSize = 6, summaryTrigger = 12}){
    super();
    this.llm = llm;
    this.windowSize = windowSize;
    this.summaryTrigger = summaryTrigger;
  }

  async addMessage(message) {
    await super.addMessage(message);
    const messages = await this.getMessages();
    // 不到出发阈值，不做任何事
    if (messages.length < this.summaryTrigger) {
      return;
    }
    await this.summarize(messages)
  }

  async summarize(messages) {
    // 拿出已有的summary
    const existingSummaryIndex = messages.findIndex(
      m => m._getType() === 'system' && m.content.startsWith("对话长期摘要")
    )

    const existingSummary = 
    existingSummaryIndex !== -1 
    ? messages[existingSummaryIndex].content
    : "";

    // 需要被压缩的旧消息
    const startIdx = existingSummaryIndex === -1 ? 0 : existingSummaryIndex + 1;
    const compressUntil = messages.length - this.windowSize;
    if(compressUntil <= startIdx) {
      return;
    }

    const toSummarize = messages.slice(startIdx, compressUntil);

    const summaryPrompt = `
      你是一个对话压缩器。
      请在【已有摘要】基础上，融合【新增对话】，生成新的长期摘要。
      要求：
      - 保留关键信息、事实、偏好、上下文
      - 不要逐句复述
      - 不要出现“用户说/AI说”

      【已有摘要】
      ${existingSummary}

      【新增对话】
      ${toSummarize.map(m => `${m._getType()}: ${m.content}`).join("\n")}
    `
    const result = await this.llm.invoke(summaryPrompt);
    const newSummary = result.content;

    // 重建history
    const newMessages = []
    newMessages.push(new SystemMessage(`对话长期摘要：${newSummary}`))

    const recent = messages.slice(-this.windowSize);
    newMessages.push(...recent);

    this.messages = newMessages;
  }
}