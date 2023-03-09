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

interface DividerProps {
    direction: "horizontal" | "vertical";
}
const Divider = styled.div<DirectionProps>`
  border: 1px solid #242628;
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
    minWidth?: number
    children: React.ReactNode; // should be jsx elements, not just booleans and objects
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
    const [paneFlexPercents, updatePanePercents] = useState<
    number[]
    >(Array.from({ length: numOfChildren }, () => 100 / numOfChildren)); // think about these calculateions - should they be rounded in any way??
    // what happens if the direction changes
    if (numOfChildren === 0) throw Error();
    if (numOfChildren === 1) return <Pane>{children}</Pane>;
    // there will be n panes and n - 1 dividers (one less divider as the last pane doesn nto need it);
    const [isDragging, setIsDragging] = useState(false);
    const [currentDividerPosition, updateCurrentDividerPosition] = useState<
        number | undefined
    >();
    const [currentDividerId, setCurrentDividerId] = useState<
        string | undefined
    >();
    // useing useMemo so all of these internal datastructures can be "rebuilt" whenever the children prop chages
    const paneIds: string[] = useMemo(
        () => Array.from({ length: numOfChildren }, () => nanoid()),
        [children]
    ); // refs??
    // of size n
    const dividerIds: string[] = useMemo(
        () => Array.from({ length: numOfChildren - 1 }, () => nanoid()),
        [children]
    );
    // each divider controls one pane (this helps so that when one of the dividers start dragging, it can point to what pane needs to be changed)
    // of size n - 1
    const dividerToPaneMap = useMemo(() => {
        // use Map() ??
        const map = new Map<string, string>();
        dividerIds.forEach((dividerId, index) => {
            map.set(dividerId, paneIds[index]);
        });
        return map;
    }, [children]);

    // use a ref???
    // no longer need this any more
    const paneToNodeMap = useMemo(
        () => new Map<string, HTMLDivElement>(),
        [children]
    );
    // of size n - 1
    const isHorizontal = direction === "horizontal";
    const onMouseUp = (e: MouseEvent) => {
        setIsDragging(false);
    };

    const recalculatePaneFlexPercents = () => {}

    useEffect(() => {
        // when the children change, recalcualte the flex percents (pase it on the number of children)
        recalculatePaneFlexPercents();
    }, [children])

    const onMouseMove = (e: MouseEvent) => {
        // NEW POSSIBLE METHOD: JUST USE THE FLEX PROPERTY TO CHANGE THINGS
        // INSTEAD OF BASING OF THINGS OF WIDTHS< WE BASE IT OFF ON PERCENTS (split betwwen the number of panes)
        // ALSO TRY AND USE THE STYLE PROP OF THE PANWE INSTEAD OF A NODE
        // THE ONLY PROBLEM/COMPLICATION WITH THIS APPROACH IS THAT EVERYTHING HAS TO ADD UP TO 100% (THIS MIGHT INCLUDE ADJUSTING OTHER PANE VALUES TO ACCOMADATE)
        if (isDragging && currentDividerId && currentDividerPosition) {
            console.log("dragging a divider");
            const paneDimensionClone = { ...paneFlexPercents }
            const paneId = dividerToPaneMap.get(currentDividerId) as string;
            const currentPaneDimensions = paneDimensionClone[paneId];
            // need to handle threshholds (minuses and plusses)
            // also minSizes
            if (isHorizontal) {
                // const newWidth = currentPaneDimensions.width + e.clientX - currentDividerPosition;
                // console.log(newWidth);
                // paneDimensionClone[paneId].width = newWidth;
                // updateCurrentDividerPosition(e.clientX);
                // updatePanePercents(paneDimensionClone);
            } else {
                // const newHeight = currentPaneDimensions.height + e.clientY - currentDividerPosition;
                // paneDimensionClone[paneId].height = newHeight;
                // updateCurrentDividerPosition(e.clientY);
                // updatePanePercents(paneDimensionClone);
            }
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

    const onMouseDown = (
        e: React.MouseEvent<HTMLDivElement>,
        dividerId: string
    ) => {
        if (isHorizontal) {
            // x for horizontal dividers
            updateCurrentDividerPosition(e.clientX);
        } else {
            // y for vertical dividers
            updateCurrentDividerPosition(e.clientY);
        }
        setCurrentDividerId(dividerId);
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

    useEffect(() => {
        const paneDimensionsClone = { ...paneFlexPercents };
        paneIds.forEach((paneId) => {
            paneDimensionsClone[paneId] = 100 / numOfChildren;
        });
        console.log(paneDimensionsClone);
        updatePanePercents(paneDimensionsClone);
    }, [children]);

    return (
        <SplitPaneContainer direction={direction}>
            {Children.map(children, (child, index) => {
                const isLastChild = index == Children.count(children) - 1;
                const paneId = paneIds[index];
                // should i do the ref for this???
                if (isLastChild)
                    return (
                        <Pane
                            ref={(node) => setPaneIdToNode(node, paneId)}
                        >
                            {child}
                        </Pane>
                    );

                const dividerId = dividerIds[index];
                return (
                    <>
                        {/* one divider is responsibl efor resizing one pande (apart from the last one) */}
                        {/* each pane and divider should have a unique id  */}
                        {/* use state to up date width/height as needed and have it reflected in styled compoenents*/}
                        {/* the state should match a specific divider to a spicif pane, so when the divider is chaged, only the asocciated pane is moved*/}
                        {/* need to have consistent ids for panes and dividers                          */}
                        <Pane
                            // ref={(node) => setPaneIdToNode(node, paneId)}>
                            style={{ flex: `${paneFlexPercents[paneId]} 1 0px` }}>
                            {child}
                        </Pane>
                        <Divider
                            direction={direction}
                            onMouseDown={(e) => onMouseDown(e, dividerId)}
                        />
                    </>
                );
            })}
        </SplitPaneContainer>
    );
}
