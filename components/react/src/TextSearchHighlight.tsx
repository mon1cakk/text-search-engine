import React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { type Matrix, search } from 'text-search-engine'

const HIGHLIGHT_TEXT_CLASS = 'hg-text'
const NORMAL_TEXT_CLASS = 'nm-text'

const HighlightContainer = styled.div`
  display: flex;
  width: 100%;
  min-height: 20px;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  background-color: white;

  .${NORMAL_TEXT_CLASS} {
    color: var(--color-neutral-3, #666);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .${HIGHLIGHT_TEXT_CLASS} {
    white-space: nowrap;
    color: var(--highlight-text, #000);
    background-color: var(--highlight-bg, #ffffff);
    border-radius: 4px;
    padding: 0 2px;
  }
`

interface HighlightComponentProps {
	source: string
	hitRanges: Matrix
	highlightStyle?: React.CSSProperties
	normalStyle?: React.CSSProperties
	containerStyle?: React.CSSProperties
}

export const HighlightComponent: React.FC<HighlightComponentProps> = ({
	source,
	hitRanges,
	highlightStyle,
	normalStyle,
	containerStyle,
}) => {
	const [renderedContent, setRenderedContent] = useState<React.ReactNode[]>([])

	useEffect(() => {
		const newContent: React.ReactNode[] = []
		let lastIndex = 0

		hitRanges.forEach(([start, end], index) => {
			if (start > lastIndex) {
				const normalText = source.slice(lastIndex, start)
				newContent.push(
					<span key={`normal-${lastIndex}`} className={NORMAL_TEXT_CLASS}>
						{normalText}
					</span>
				)
			}

			const highlightText = source.slice(start, end + 1)
			newContent.push(
				<span key={`highlight-${start}`} className={HIGHLIGHT_TEXT_CLASS} style={highlightStyle}>
					{highlightText}
				</span>
			)

			lastIndex = end + 1
		})

		if (lastIndex < source.length) {
			const remainingText = source.slice(lastIndex)
			newContent.push(
				<span key={`normal-${lastIndex}`} className={NORMAL_TEXT_CLASS}>
					{remainingText}
				</span>
			)
		}

		setRenderedContent(newContent)
	}, [source, hitRanges, highlightStyle])

	return (
		<HighlightContainer style={containerStyle}>
			{renderedContent.map((node) =>
				React.isValidElement(node)
					? React.cloneElement(node, {
							style: {
								...(node.props.style || {}),
								...(node.props.className === HIGHLIGHT_TEXT_CLASS ? highlightStyle : normalStyle),
							},
						} as React.HTMLAttributes<HTMLSpanElement>)
					: node
			)}
		</HighlightContainer>
	)
}

interface TextSearchProps {
	source: string
	target?: string
	onSearch?: (hitRanges: Matrix) => void
	highlightStyle?: React.CSSProperties
	normalStyle?: React.CSSProperties
	containerStyle?: React.CSSProperties
	children?: React.ReactNode
}

export const TextSearch: React.FC<TextSearchProps> = ({
	source,
	target,
	onSearch,
	highlightStyle,
	normalStyle,
	containerStyle,
	children,
}) => {
	const [internalTarget, setInternalTarget] = useState(target || '')
	const [hitRanges, setHitRanges] = useState<Matrix>([])

	const handleSearch = useCallback(
		(searchTarget: string) => {
			const result = search(source, searchTarget)
			setHitRanges(result || [])
			if (onSearch) {
				onSearch(result || [])
			}
		},
		[source, onSearch]
	)

	useEffect(() => {
		if (target !== undefined) {
			setInternalTarget(target)
			handleSearch(target)
		}
	}, [target, handleSearch])

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newTarget = e.target.value
		setInternalTarget(newTarget)
		handleSearch(newTarget)
	}

	return (
		<div>
			{/* 
			  // 搜索输入框组件
			  // 注：此输入框暂时不需要，但在未来的 ListSearch 组件中可能会用到
			  // 暂时注释掉，以便将来参考或使用
			  {target === undefined && (
			    <input
			      type='text'
			      value={internalTarget}
			      onChange={handleInputChange}
			      placeholder='输入搜索文本'
			      style={{
			        width: '100%',
			        marginBottom: '10px',
			        padding: '8px 12px',
			        fontSize: '16px',
			        border: '2px solid #007bff',
			        borderRadius: '4px',
			        outline: 'none',
			      }}
			    />
			  )}
			*/}
			{children || (
				<HighlightComponent
					source={source}
					hitRanges={hitRanges}
					highlightStyle={highlightStyle}
					normalStyle={normalStyle}
					containerStyle={containerStyle}
				/>
			)}
		</div>
	)
}

export default TextSearch