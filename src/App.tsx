import { useState } from "react";
import styled from "styled-components";
import SplitPane, { SplitPaneDirection } from "./components/SplitPane";

const Demo = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DemoContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

const DemoSplitPaneContainer = styled.div`
  height: 30%;
  width: 60%;
  border: 1px solid #242628;
`;

const ButtonRow = styled.div`
  /* margin-top: 10px; */
  width: 100%;
  /* text-align: center; */
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  gap: 5px;
`;

// set up this site for demo
// split pane in the center (fixed witdth and height)
// buttons on the bottom
function App() {
  const [numOfChildren, setNumOfChildren] = useState(3);
  const [direction, setDirection] = useState<SplitPaneDirection>("horizontal");

  const [isEnabled, toggleIsEnabled] = useState(true);

  const array = Array.from({ length: numOfChildren }, (_, i) => (
    <Demo key={i}>{i + 1}</Demo>
  ));
  const addChild = () => {
    setNumOfChildren((n) => n + 1);
  };

  const removeChild = () => {
    if (numOfChildren === 1) return;
    setNumOfChildren((n) => n - 1);
  };

  const toggleDirection = () => {
    if (direction === "horizontal") {
      setDirection("vertical");
    } else {
      setDirection("horizontal");
    }
  };

  return (
    <DemoContainer>
      <h1>SplitPane Demo</h1>
      <DemoSplitPaneContainer>
        <SplitPane direction={direction} enableResize={isEnabled}>
          {array}
        </SplitPane>
      </DemoSplitPaneContainer>
        <ButtonRow>
          <button onClick={addChild}>Add Child</button>
          <button onClick={removeChild}>Remove Child</button>
          <button onClick={toggleDirection}>Toggle Direction</button>
          <button onClick={() => toggleIsEnabled((d) => !d)}>
            Toggle Resize
          </button>
        </ButtonRow>
    </DemoContainer>
  );
}

export default App;
