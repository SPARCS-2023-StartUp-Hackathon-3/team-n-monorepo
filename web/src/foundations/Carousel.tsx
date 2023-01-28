/* eslint-disable */
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface Props {
  fullWidth: number;
  fullHeight: number;
  items: React.ReactElement[];
  emitCurrentIndex: (index: number) => void;
}

function Carousel({ fullWidth, fullHeight, items, emitCurrentIndex }: Props) {
  const arrayLength = useMemo(() => items.length, [items]); // 아이템의 총 수
  const itemWidth = useMemo(() => fullWidth * 0.6, [fullWidth]); // 아이템의 너비
  const distance = useMemo(() => itemWidth / 4, [itemWidth]); // 아이템간의 거리
  const itemFullWidth = useMemo(
    () => arrayLength * distance,
    [arrayLength, distance]
  ); // 캐러셀 아이템 전체 길이

  const [currentX, setCurrentX] = useState(0); // 현재 translateX 값
  const [offsetX, setOffsetX] = useState(0); // 이전 translateX 값
  const [xSpeed, setXSpeed] = useState(0); // 마우스 빠르기
  const [isDown, setIsDown] = useState(false); // 터치 상태인지
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 아이템의 index

  // 마우스 이벤트
  useEffect(() => {
    if (Math.abs(xSpeed) > 0.1) {
      setCurrentX((x) => {
        let newX = x;
        while (newX > 0) {
          newX -= itemFullWidth || 1;
        }
        return (newX + xSpeed) % (itemFullWidth || 1);
      });
    } else {
      setXSpeed(0);
    }
  }, [xSpeed, itemFullWidth]);

  useEffect(() => {
    let timer: any;
    timer = requestAnimationFrame(function slowDown() {
      setXSpeed((speed) => speed * 0.92);
      timer = requestAnimationFrame(slowDown);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  const onMouseDown = useCallback((e: any) => {
    const { clientX } = e.type === "mousedown" ? e : e.touches[0];
    setXSpeed(0);
    setIsDown(true);
    setOffsetX(clientX);
  }, []);

  const onMouseUp = useCallback(() => {
    setIsDown(false);
  }, []);

  const onMouseMove = (e: any) => {
    const { clientX } = e.type === "mousemove" ? e : e.touches[0];
    setXSpeed((clientX - offsetX) * 0.85);
    setOffsetX(clientX);
  };

  useEffect(() => {
    let newCurrentIndex = Math.round(-currentX / (distance || 1));
    while (newCurrentIndex < 0 || newCurrentIndex >= arrayLength) {
      if (newCurrentIndex < 0) newCurrentIndex += arrayLength;
      else newCurrentIndex -= arrayLength;
    }
    setCurrentIndex(Math.abs(newCurrentIndex));
  }, [currentX, distance, arrayLength]);

  useEffect(() => {
    emitCurrentIndex(currentIndex);
  }, [emitCurrentIndex, currentIndex]);

  const visibleRange = 4;

  return (
    <>
      <div className="wrapper">
        {fullWidth > 350 ? (
          <div
            className="arrowButton"
            onClick={() => setXSpeed(distance / 12.2)}
          >
            {"<"}
          </div>
        ) : (
          <div />
        )}
        <div
          className="carousel"
          onMouseDown={onMouseDown}
          onMouseMove={isDown ? onMouseMove : () => {}}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onMouseDown}
          onTouchMove={isDown ? onMouseMove : () => {}}
          onTouchEnd={onMouseUp}
          onTouchCancel={onMouseUp}
        >
          {items.map((item, index) => {
            let indexFromCurrent = Math.abs(index - currentIndex);
            let distanceFromCurrent = distance * index;

            if (
              currentIndex === 0 ||
              currentIndex === 1 ||
              currentIndex === 2
            ) {
              if (
                index === arrayLength - 1 ||
                index === arrayLength - 2 ||
                index === arrayLength - 3
              ) {
                indexFromCurrent = Math.abs(arrayLength - indexFromCurrent);
                if (currentX > itemWidth - itemFullWidth) {
                  distanceFromCurrent -= itemFullWidth;
                }
              } else if (currentX < itemWidth - itemFullWidth) {
                distanceFromCurrent += itemFullWidth;
              }
            }

            if (
              currentIndex === arrayLength - 1 ||
              currentIndex === arrayLength - 2 ||
              currentIndex === arrayLength - 3
            ) {
              if (index === 0 || index === 1 || index === 2) {
                indexFromCurrent = Math.abs(arrayLength - indexFromCurrent);
                distanceFromCurrent += itemFullWidth;
              }
            }

            const isVisible = indexFromCurrent < visibleRange;
            return (
              isVisible && (
                <div
                  className="item"
                  key={index}
                  style={{
                    transform: `perspective(100px) translateX(${
                      currentX + distanceFromCurrent
                    }px) scale(${
                      1 -
                      Math.min(
                        1,
                        Math.abs((currentX + distanceFromCurrent) / itemWidth)
                      )
                    })`,
                    zIndex: 10 - indexFromCurrent,
                  }}
                >
                  {item}
                </div>
              )
            );
          })}
        </div>
        {fullWidth > 350 ? (
          <div
            className="arrowButton"
            onClick={() => setXSpeed(-distance / 12.2)}
          >
            {">"}
          </div>
        ) : (
          <div />
        )}
      </div>
      <style jsx>{`
        .wrapper {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .arrowButton {
          font-size: 35px;
          color: black;
          cursor: pointer;
          user-select: none;
          margin: 0 2rem;
        }
        .carousel {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: ${fullWidth}px;
          height: ${fullWidth}px;
          overflow-x: hidden;
          margin: -180px;
        }
        .item {
          position: absolute;
          width: ${itemWidth}px;
          height: ${itemWidth}px;
          display: flex;
          justify-content: center;
          align-items: center;

          border-radius: 10px;
          background-color: white;
          box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.16);
        }
      `}</style>
    </>
  );
}
export default Carousel;
