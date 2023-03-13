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

const Container = styled.div`
  height: 500px;
  width: 100%;
  border: 1px solid #242628;
`;

function App() {
  const [numOfChildren, setNumOfChildren] = useState(1);
  const [direction, setDirection] = useState<SplitPaneDirection>("vertical");

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
    <Container>
      <SplitPane direction="horizontal" enableResize={isEnabled}>
        <SplitPane direction={direction}>{array}</SplitPane>
        <Demo>2</Demo>
      </SplitPane>
      <button onClick={addChild}>Add Child</button>
      <button onClick={removeChild}>Remove Child</button>
      <button onClick={toggleDirection}>Toggle Direction</button>
      <button onClick={() => toggleIsEnabled((d) => !d)}>Toggle Resize</button>
    </Container>
  );
}

export default App;
