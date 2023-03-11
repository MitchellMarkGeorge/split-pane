import { nanoid } from "nanoid";
import React, { Children, useEffect, useState, useRef, useMemo } from "react";
import styled, { css } from "styled-components";

interface DirectionProps {
  direction: "horizontal" | "vertical";
}
const SplitPaneContainer = styled.div<DirectionProps>`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: ${(props) =>
    props.direction === "horizontal" ? "row" : "column"};
  /* align-items: flex-start; */
  /* flex: 1; */
  overflow: hidden;
`;

const Divider = styled.div<DirectionProps>`
  border: 3px solid #242628;
  ${(props) => {
    if (props.direction === "horizontal") {
      return css`
        /* width: 0; // is this needed? */
        height: 100%;
        cursor: col-resize;
      `;
    } else
      return css`
        /* height: 0; // is this needed? */
        width: 100%;
        cursor: row-resize;
      `;
  }}
`;

interface SplitPaneProps {
  direction: "horizontal" | "vertical";
  minWidth?: number;
  // think about defaultSizes, minSizes, and maxSizes
  children: JSX.Element | JSX.Element[]; // allows only jsx elements and arrays
}

// interface PaneDimensions {
//     width: number;
//     height: number;
// }

export default function SplitPane({ direction, children }: SplitPaneProps) {
  // const childrenNumber = Children.count(children);
  // trying to insert a divider in between all the child components
  // insead what we do here is store all ther percentages of all the panes
  // all of these percents need to equal a 100

  // with this being in state, if the children changes, the paneIs in the paneFlexPercents with no longer match with anything and will need to be rebuild
  // if the children prop changes in any way:
  // 1. the paneFlexPercents might need to be recalculated (if the number of them chages)
  // 1. the number of paneFlexPercents might need to be changed (might be more or less panes)
  // 3. There might be situations where the percentages stay the same

  // by using a simple array of numbers instead of a "map" we can remove the problem of out of touch panelId
  // eg: there are 4 panes
  // paneFlexPercents could look like [25, 25, 25, 25]
  // and is the panes change to 3
  // paneFlexPercents could look like [25, 25, 50]
  // each number directly coresponds to a pane

  // need to migrate from the React.Children API (marked as legacy)
  const numOfChildren = useMemo(() => Children.count(children), [children]);
  // const [currentDividerDomNode, setCurrentDividerDomNode] = useState<HTMLDivElement | null>(null)
  // is I use the flex approach, I am pretty muich splting up the container into a 100 parts and sharing them out to each pane
  const [paneFlexPercents, updatePanePercents] = useState<number[]>(
    Array.from({ length: numOfChildren }, () => 100 / numOfChildren)
  );
  if (numOfChildren === 0) throw Error();
  const [isDragging, setIsDragging] = useState(false);
  const [initalDividerPosition, setInitalDividerPosition] = useState<
    number | null
  >(null);
  const [currentDividerIndex, setCurrentDividerIndex] = useState<number | null>(
    null
  );

  const paneNodes = useRef<HTMLDivElement[]>([]);
  const isMounted = useRef(false);
  const isHorizontal = direction === "horizontal";
  const onMouseUp = (e: MouseEvent) => {
    setIsDragging(false);
    // think about this
    // setCurrentDividerIndex(null);
    // setInitalDividerPosition(null);
  };

  const recalculatePaneFlexPercents = () => {
    // what is the flex percents are not even??
    const newPaneFlexPercents = Array.from(
      { length: numOfChildren },
      () => 100 / numOfChildren
    );
    updatePanePercents(newPaneFlexPercents);
  };

  useEffect(() => {
    // when the children change, recalcualte the flex percents (base it on the number of children)
    if (isMounted.current) {
      recalculatePaneFlexPercents();
      console.log(paneNodes, direction);
    } else {
      isMounted.current = true;
    }
  }, [numOfChildren]);

  const onMouseMove = (e: MouseEvent) => {
    // NEW POSSIBLE METHOD: JUST USE THE FLEX PROPERTY TO CHANGE THINGS
    // INSTEAD OF BASING OF THINGS OF WIDTHS< WE BASE IT OFF ON PERCENTS (split betwwen the number of panes)
    // ALSO TRY AND USE THE STYLE PROP OF THE PANWE INSTEAD OF A NODE
    // THE ONLY PROBLEM/COMPLICATION WITH THIS APPROACH IS THAT EVERYTHING HAS TO ADD UP TO 100% (THIS MIGHT INCLUDE ADJUSTING OTHER PANE VALUES TO ACCOMADATE)
    // what about currentDividerPosition??
    if (
      isDragging &&
      currentDividerIndex !== null &&
      initalDividerPosition !== null
      // currentDividerDomNode !== null
    ) {
      // based on http://jsfiddle.net/6j10L3x2/1/ and https://codesandbox.io/s/dry-currying-dy9z2b?file=/src/index.js:444-451

      // CONFIRM ALL VALUES (offsetWidth, pageX)

      // console.log(paneNodes.current);
      // console.log(e.target);
      // console.log("dragging a divider");
      // console.log(currentDividerDomNode);

      // const paneDimensionClone = { ...paneFlexPercents }
      // const paneId = dividerToPaneMap.get(currentDividerIndex) as string;
      // const currentPaneDimensions = paneDimensionClone[paneId];
      // need to handle threshholds (minuses and plusses)
      // also minSizes

      // the currentDivicerInde will always being in range of the size of paneFlexPercents
      const paneFlexPercentsClone = [...paneFlexPercents];
      // console.log(paneFlexPercentsClone);
      // with this approach, we only handle a max of 2 panes at a time: the panes at either side of the divider
      // bieign pane that is being resized and the pane that is being resized into
      const firstPaneDomNode = paneNodes.current[currentDividerIndex];
      const secondPaneDomNode = paneNodes.current[currentDividerIndex + 1];
      if (!firstPaneDomNode || !secondPaneDomNode) return;

      let firstPaneSize = isHorizontal
        ? firstPaneDomNode.offsetWidth
        : firstPaneDomNode.offsetHeight;
      let secondPaneSize = isHorizontal
        ? secondPaneDomNode.offsetWidth
        : secondPaneDomNode.offsetHeight;

      // this represents the sums of both pane flex percents. we do this as in this context, we are trying to share the space of these two panes
      const paneSizeSum = firstPaneSize + secondPaneSize;
      // by design, this will always be 100 (representing 100%)
      // const flexPercentSum = firstPaneFlexPercent + secondPaneFlexPercent;
      // would recalculate the paneFlexPerc
      // both pageX/Y and clientX/Y work
      let nextDividerPosition = isHorizontal ? e.pageX : e.pageY;
      const positionDifference = nextDividerPosition - initalDividerPosition;

      firstPaneSize += positionDifference;
      secondPaneSize -= positionDifference;

      // ???
      if (firstPaneSize < 0) {
        secondPaneSize += firstPaneSize;
        nextDividerPosition -= firstPaneSize;
        firstPaneSize = 0;
      }

      if (secondPaneSize < 0) {
        firstPaneSize += secondPaneSize;
        nextDividerPosition += secondPaneSize;
        secondPaneSize = 0;
      }

      // flexPercentSum will always be 100 as all flex-grow percentages sum up to 100
      // const newFirstPaneFlexPercent = flexPercentSum * (firstPaneSize / paneSizeSum);
      // const newSecondPaneFlexPercent = flexPercentSum * (secondPaneSize / paneSizeSum);

      const newFirstPaneFlexPercent = 100 * (firstPaneSize / paneSizeSum);
      const newSecondPaneFlexPercent = 100 * (secondPaneSize / paneSizeSum);

      paneFlexPercentsClone[currentDividerIndex] = newFirstPaneFlexPercent;
      paneFlexPercentsClone[currentDividerIndex + 1] = newSecondPaneFlexPercent;
      console.log(paneFlexPercentsClone);
      updatePanePercents(paneFlexPercentsClone);
      setInitalDividerPosition(nextDividerPosition);

    }
  };

  function reMapArray(array: number[], changedIndex: number, arraySum = 100) {
    const sum = array.reduce((a, b) => a + b);
    const adjust = (sum - arraySum) / (array.length - 1);
    return array.map((a, i) => (i === changedIndex ? a : a - adjust));
  }
  const onMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    dividerIndex: number
  ) => {
    if (isHorizontal) {
      // x for horizontal dividers
      setInitalDividerPosition(e.pageX);
    } else {
      // y for vertical dividers
      setInitalDividerPosition(e.pageY);
    }
    setCurrentDividerIndex(dividerIndex);
    setIsDragging(true);
  };
  useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  });

  const addPaneNode = (node: HTMLDivElement | null, index: number) => {
    if (node) {
      paneNodes.current[index] = node;
    } else {
      paneNodes.current.splice(index, 1);
    }
  };

  return (
    <SplitPaneContainer direction={direction}>
      {Children.map(children, (child, index) => {
        const isLastChild = index == numOfChildren - 1;
        const paneStyle: React.CSSProperties = {
          flexGrow: paneFlexPercents[index],
          flexShrink: 1,
          flexBasis: 0,
          overflow: "hidden",
          ...(isDragging ? { userSelect: "none" } : null), // so nothing gets acciddentaly selected when dragging
        };
        if (isLastChild)
          return (
            <div
              ref={(node) => addPaneNode(node, index)}
              style={paneStyle}
            >
              {child}
            </div>
          );

        return (
          <>
            {/* one divider is responsibl efor resizing one pande (apart from the last one) */}
            <div
              ref={(node) => addPaneNode(node, index)}
              style={paneStyle}
            >
              {child}
            </div>
            <Divider
              direction={direction}
              onMouseDown={(e) => onMouseDown(e, index)}
            />
          </>
        );
      })}
    </SplitPaneContainer>
  );
}
