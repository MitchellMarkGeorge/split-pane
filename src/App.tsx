import styled from "styled-components"
import SplitPane from "./components/SplitPane"
const Demo = styled.div`
  /* height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center; */
`
function App() {
  return (
    <SplitPane direction="horizontal">
      <SplitPane direction="vertical">
        <Demo>1</Demo>
        <Demo>2</Demo>
        <SplitPane direction="horizontal">

          <Demo>3</Demo>
          <Demo>3.5</Demo>
        </SplitPane>
        {/* <Demo>5</Demo> */}
      </SplitPane>
      <Demo>4</Demo>
    </SplitPane>
  )

}

export default App
