import { StateGraph, StateSchema, MessagesValue, START, END } from '@langchain/langgraph'

const State = new StateSchema({
  messages: MessagesValue
})

const mockLLM = (state) => {
  return {messages:[{role:'ai', content:'hello world'}]}
}


const graph = new StateGraph(State).addNode('mock_llm', mockLLM).addEdge(START, 'mock_llm').addEdge('mock_llm', END).compile();

const response = await graph.stream({messages:[{role:'human', content:'hi！'}]});

for await (const message of response) {
  console.log(message);
}