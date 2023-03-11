import { nanoid } from "nanoid";
import React, { Children, useEffect, useState, useRef, useMemo } from "react";
import styled, { css } from "styled-components";

// think about this.....
const precise = (n: number) => {
    return Number(n.toPrecision(10));
}

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
  border: 5px solid #242628;
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

// interface PaneProps {
//     height?: number;
//     width?: number;
// }
const Pane = styled.div`
  /* display: flex; */
  /* height: 100%; */
  /* width: 100%; */
  /* max-width: 300px; */
  /* min-width: 100px; */
  /* flex: 1; */
  /* align-items: stretch; */
  /* flex-basis: 1; // for some reason with it being like this it refuses to move */
  overflow: hidden;
  /* align-items: center; */
  /* justify-content: center; */
`;

interface SplitPaneProps {
    direction: "horizontal" | "vertical";
    minWidth?: number;
    // children: React.ReactNode; // should be jsx elements, not just booleans and objects
    children: JSX.Element[]; // should be jsx elements, not just booleans and objects
    // TODO might use JSX.Element[] instead
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

    // these have to be in state so
    const numOfChildren = useMemo(() => Children.count(children), [children]);
    // const [currentDividerDomNode, setCurrentDividerDomNode] = useState<HTMLDivElement | null>(null)
    // is I use the flex approach, I am pretty muich splting up the container into a 100 parts and sharing them out to each pane
    const [paneFlexPercents, updatePanePercents] = useState<number[]>(
        Array.from({ length: numOfChildren }, () => (100 / numOfChildren))
    ); // think about these calculateions - should they be rounded in any way??
    // might have to use Number.toPrecision() or Number.toFixed()
    // what happens if the direction changes
    if (numOfChildren === 0) throw Error();
    if (numOfChildren === 1) return <Pane style={{ flex: 1}}>{children}</Pane>;
    // there will be n panes and n - 1 dividers (one less divider as the last pane doesn nto need it);
    const [isDragging, setIsDragging] = useState(false);
    const [initalDividerPosition, setInitalDividerPosition] = useState<
        number | null
    >(null);
    const [currentDividerIndex, setCurrentDividerIndex] = useState<number | null>(
        null
    );

    const paneNodes = useRef<HTMLDivElement[]>([]);
    // useing useMemo so all of these internal datastructures can be "rebuilt" whenever the children prop chages
    //   const paneIds: string[] = useMemo(
    //     () => Array.from({ length: numOfChildren }, () => nanoid()),
    //     [children]
    //   ); // refs??
    //   // of size n
    //   const dividerIds: string[] = useMemo(
    //     () => Array.from({ length: numOfChildren - 1 }, () => nanoid()),
    //     [children]
    //   );
    // each divider controls one pane (this helps so that when one of the dividers start dragging, it can point to what pane needs to be changed)
    // of size n - 1
    //   const dividerToPaneMap = useMemo(() => {
    //     // use Map() ??
    //     const map = new Map<string, string>();
    //     dividerIds.forEach((dividerId, index) => {
    //       map.set(dividerId, paneIds[index]);
    //     });
    //     return map;
    //   }, [children]); // is it on children change or children count change

    // use a ref???
    // no longer need this any more
    // const paneToNodeMap = useMemo(
    //     () => new Map<string, HTMLDivElement>(),
    //     [children]
    // );
    // of size n - 1
    const isHorizontal = direction === "horizontal";
    const onMouseUp = (e: MouseEvent) => {
        setIsDragging(false);
        // think about this
        // setCurrentDividerIndex(null);
        // setInitalDividerPosition(null);
    };

    const recalculatePaneFlexPercents = () => { };

    useEffect(() => {
        // when the children change, recalcualte the flex percents (base it on the number of children)
        recalculatePaneFlexPercents();
    }, [children]);

    const getPercentageDifference = (a: number, b: number) => {
        if (a === 0 && b === 0) return 0;
        // https://byjus.com/percent-difference-formula/#:~:text=Percent%20difference%20formula%20is%20obtained,then%20multiplying%20it%20with%20100.
        return ((a - b) / ((a + b) / 2)) * 100;
    }


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
            const firstPaneDomNode = paneNodes.current[currentDividerIndex]
            const secondPaneDomNode = paneNodes.current[currentDividerIndex + 1];
            if (!firstPaneDomNode || !secondPaneDomNode) return;


            const firstPaneFlexPercent = paneFlexPercentsClone[currentDividerIndex];
            const secondPaneFlexPercent = paneFlexPercentsClone[currentDividerIndex + 1];
            let firstPaneSize = isHorizontal ? firstPaneDomNode.offsetWidth : firstPaneDomNode.offsetHeight;
            let secondPaneSize = isHorizontal ? secondPaneDomNode.offsetWidth : secondPaneDomNode.offsetHeight;


            // this represents the sums of both pane flex percents. we do this as in this context, we are trying to share the space of these two panes
            const paneSizeSum =  firstPaneSize + secondPaneSize;
            const flexPercentSum = firstPaneFlexPercent + secondPaneFlexPercent;
            // would recalculate the paneFlexPerc
            let nextDividerPosition = isHorizontal ? e.pageX : e.pageY;
            const positionDifference = nextDividerPosition - initalDividerPosition;

            firstPaneSize += positionDifference;
            secondPaneSize -= positionDifference;

            if (firstPaneSize < 0) {
                secondPaneSize += firstPaneSize;
                nextDividerPosition -= firstPaneSize;
                firstPaneSize = 0;
            }

            if (secondPaneFlexPercent < 0) {
                firstPaneSize += secondPaneSize;
                nextDividerPosition += secondPaneSize;
                secondPaneSize = 0;
            }

            // flex percent sum should be 100
            const newFirstPaneFlexPercent = flexPercentSum * (firstPaneSize / paneSizeSum);
            const newSecondPaneFlexPercent = flexPercentSum * (secondPaneSize / paneSizeSum);

            paneFlexPercentsClone[currentDividerIndex] = newFirstPaneFlexPercent;
            paneFlexPercentsClone[currentDividerIndex + 1] = newSecondPaneFlexPercent;
            console.log(paneFlexPercentsClone);
            updatePanePercents(paneFlexPercentsClone);
            setInitalDividerPosition(nextDividerPosition);
            
            // console.log("isLastDivider", isLastDivider);
            // as the user is "dragging" the divider, we calculate the percent differecne between the inital divider position and the nextDivider position (where the mouse currently is)
            // we use this percent difference as the the proposed percentage change to the accossiated pane and the change is reflected to the rest of the panePercentafes
            // if (isHorizontal) {
            //     console.log("horizontal drag");
            //     console.log("difference", e.clientX - initalDividerPosition);
            // } else {
            //     console.log("vertical drag");
            //     console.log(e.clientY - initalDividerPosition);
            // }

            // const dividerPercentageDifference = getPercentageDifference(nextDividerPosition, initalDividerPosition);
            // if (dividerPercentageDifference === 0) return;

            // console.log(dividerPercentageDifference);
            // paneFlexPercentsClone[currentDividerIndex] += dividerPercentageDifference;
            // const affectedSiblingPaneIdnex = isLastDivider ? currentDividerIndex % n - 1 : currentDividerIndex + 1; // is is the last divider, use the previous pane elde the next one
            // const affectedSiblingPaneIdnex = currentDividerIndex + 1;
            // paneFlexPercentsClone[affectedSiblingPaneIdnex] -= dividerPercentageDifference;
            // console.log(reMapArray(paneFlexPercentsClone, currentDividerIndex));
            // updatePanePercents(reMapArray(paneFlexPercentsClone, currentDividerIndex));
            // setInitalDividerPosition(nextDividerPosition);
            // for some reason on resize the divider is stil not lining up with the cursor





            //   console.log("dragging a divider");
            //   console.log("current divider", currentDividerId);
            // //   const paneId = dividerToPaneMap.get(currentDividerId);
            //   console.log("current paneId", paneId);
            //   if (paneId) {
            //     const node = paneToNodeMap.get(paneId);
            //     node && console.log("pane node: ", node);
            //   }
            // console.log(e)
        }
    };

    // useEffect(() => {
    //     if (currentDividerId && isDragging) {
    //         const paneId = dividerToPaneMap.get(currentDividerId) as string;
    //         const node = paneToNodeMap.get(paneId) as HTMLDivElement;
    //         if (isHorizontal) {
    //             // this works for flex: 1;
    //             // node.style.maxWidth = `${paneDimensions[paneId].width}px`
    //             // node.style.minWidth = `${paneDimensions[paneId].width}px`
    //             node.style.width = `${paneFlexPercents[paneId].width}px`
    //             // node.style.maxWidth = `${paneDimensions[paneId].width}px`
    //         } else {
    //             node.style.height = `${paneFlexPercents[paneId].height}px`
    //             // node.style.minHeight = `${paneDimensions[paneId].height}px`
    //             // node.style.maxHeight = `${paneDimensions[paneId].height}px`
    //             // node.style.maxHeight = `${paneDimensions[paneId].height}px`
    //         }
    //     }
    // }, [paneFlexPercents])
    function reMapArray(array: number[], changedIndex: number, arraySum = 100) {
        const sum = array.reduce( (a, b) => a+b );
        const adjust = (sum - arraySum) / (array.length - 1);
        return array.map( (a, i) => i === changedIndex ? a : a - adjust );
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
        // setCurrentDividerDomNode(e.target as HTMLDivElement)
        // should i have all pane and divider elements stored in state???
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

    // useEffect(() => {

    // }, [isDragging, direction]);

    // const setPaneIdToNode = (node: HTMLDivElement | null, paneId: string) => {
    //     if (node) {
    //         paneToNodeMap.set(paneId, node);
    //         const paneDimensionsClone = { ...paneFlexPercents };
    //         paneDimensionsClone[paneId] = {
    //             height: node.clientHeight,
    //             width: node.clientWidth,
    //         };
    //         // updatePaneDimensions(paneDimensionsClone);
    //     } else if (paneToNodeMap.has(paneId)) {
    //         // think about this!!!!
    //         paneToNodeMap.delete(paneId);
    //     }
    // };

    // useEffect(() => {
    //     const paneDimensionsClone = { ...paneFlexPercents };
    //     paneIds.forEach((paneId) => {
    //         paneDimensionsClone[paneId] = 100 / numOfChildren;
    //     });
    //     console.log(paneDimensionsClone);
    //     updatePanePercents(paneDimensionsClone);
    // }, [children]);

    const addPaneNode = (node: HTMLDivElement | null, index: number) => {
        // todo test that his works as expected, espoeccialy when a new child is added
        // if not, I 
        // if this approach does not woek, I can just save the dom node of the divider and access the pane nodes from there
        if (node) {
            paneNodes.current[index] = node;
        } else {
            // remove node from array???
            paneNodes.current.splice(index, 1);
        }
    }

    return (
        <SplitPaneContainer direction={direction}>
            {Children.map(children, (child, index) => {
                const isLastChild = index == Children.count(children) - 1;
                // const paneId = paneIds[index];
                // should i do the ref for this???
                const paneStyle: React.CSSProperties = {
                    flexGrow: paneFlexPercents[index],
                    flexShrink: 1,
                    flexBasis: 0,
                    overflow: "hidden",
                    ...(isDragging ? { userSelect: "none" } : null), // so nothing gets acciddentaly selected when dragging
                };
                if (isLastChild)
                    return (
                        <Pane
                            ref={(node) => addPaneNode(node, index)}
                            // style={{ flex: `${paneFlexPercents[index]} 1 0` }}>
                            style={paneStyle}
                        >
                            {child}
                        </Pane>
                    );

                // const dividerId = dividerIds[index];
                return (
                    <>
                        {/* one divider is responsibl efor resizing one pande (apart from the last one) */}
                        {/* each pane and divider should have a unique id  */}
                        {/* use state to up date width/height as needed and have it reflected in styled compoenents*/}
                        {/* the state should match a specific divider to a spicif pane, so when the divider is chaged, only the asocciated pane is moved*/}
                        {/* need to have consistent ids for panes and dividers                          */}
                        <Pane
                            // ref={(node) => setPaneIdToNode(node, paneId)}>
                            ref={(node) => addPaneNode(node, index)}
                            // style={{ flex: `${paneFlexPercents[index]} 1 0` }}>
                            style={paneStyle}
                        >
                            {child}
                        </Pane>
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
