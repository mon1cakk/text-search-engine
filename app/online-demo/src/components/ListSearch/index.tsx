import { Card, CardContent, List, ListItem, ListItemText, TextField, Typography } from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { type Matrix, extractBoundaryMapping, searchSentenceByBoundaryMapping } from 'text-search-engine'
import { INPUT_ANIMATION_CONFIG, TEXT_ACTIVE_CONFIG } from '../../config/index'
import { useStyles } from '../../hooks/useStyles'
import { IconParkNames } from '../../shared/constants'
import { Schools } from '../../shared/schools'
import LightedText from '../LightedText'
import LinkWithIcon from '../link-with-icon'
import styles from './index.module.css'

interface ListItemType {
	passValue: string
	hitRanges?: Matrix
}

const ListSearch = () => {
	const classes = useStyles()
	const [originalList, setOriginalList] = useState<string[]>(Schools)
	const [inputValue, setInputValue] = useState('')
	const [newItem, setNewItem] = useState('')

	const sourceMappingArray = useMemo(() => {
		return originalList.map((item) => ({
			...extractBoundaryMapping(item.toLocaleLowerCase()),
			passValue: item,
		}))
	}, [originalList])

	const [filteredList, count, searchTime] = useMemo(() => {
		if (!inputValue) {
			return [sourceMappingArray.map((i) => ({ passValue: i.passValue })) as ListItemType[], 0, 0]
		}
		const start = performance.now()
		const filteredData = sourceMappingArray
			.reduce<ListItemType[]>((acc, item) => {
				const hitRanges = searchSentenceByBoundaryMapping(item, inputValue)
				hitRanges &&
					acc.push({
						passValue: item.passValue,
						hitRanges,
					})
				return acc
			}, [])
			.sort((a, b) => {
				if (a.hitRanges && b.hitRanges) {
					return a.hitRanges.length - b.hitRanges.length
				}
				return 0
			})
		return [filteredData, filteredData.length, performance.now() - start]
	}, [inputValue, sourceMappingArray])

	const handleAddItem = useCallback(() => {
		if (originalList.includes(newItem)) {
			throw new Error(`${newItem} already exists`)
		}
		setOriginalList([newItem, ...originalList])
		setNewItem('')
	}, [newItem, originalList])

	return (
		<Card
			sx={{
				transition: 'all 0.3s ease-in-out',
				backgroundColor: 'var(--color-linear-bg-start)',
				color: 'var(--color-neutral-1)',
			}}
		>
			<CardContent>
				<Typography variant='h5' component='div' gutterBottom>
					List Filtering
				</Typography>
				<TextField
					fullWidth
					label="Enter keywords to filter(like 'zhog' or 'fujian' or 'beijing)"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value.toLocaleLowerCase())}
					variant='standard'
					className={`input-field ${classes.customTextField}`}
					sx={{
						mb: 2,
					}}
				/>
				<Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
					<span className='text-skin-neutral-5'>
						found {count} matches in {searchTime.toFixed(2)} milliseconds
					</span>
				</Typography>
				<List
					sx={(theme) => ({
						[theme.breakpoints.down('sm')]: {
							maxHeight: '40vh',
							overflow: 'auto',
						},
						[theme.breakpoints.up('sm')]: {
							maxHeight: '50vh',
							overflow: 'auto',
						},
					})}
				>
					{filteredList.map((item, index) => (
						<ListItem
							className={`${styles.listItem} ${classes.customListItem}`}
							key={`${item.passValue}-${index}`}
							sx={{
								transition: 'all 0.3s ease-in-out',
								'&:hover': { backgroundColor: 'action.hover' },
								height: '40px',
								minHeight: 'unset',
							}}
						>
							<ListItemText
								primary={
									<Typography sx={{ ...TEXT_ACTIVE_CONFIG }}>
										<LightedText text={item.passValue} ranges={item.hitRanges} className='bg-yellow font-bold' />
									</Typography>
								}
							/>
							<span className={styles.deleteBtn}>
								<LinkWithIcon
									name={IconParkNames.delete}
									onClick={() => {
										setOriginalList(originalList.filter((i) => i !== item.passValue))
									}}
								/>
							</span>
						</ListItem>
					))}
				</List>
				<Typography variant='h6' component='div' gutterBottom>
					Add Data
				</Typography>
				<TextField
					fullWidth
					label="Typing something then key down 'enter' to add"
					value={newItem}
					onChange={(e) => setNewItem(e.target.value)}
					variant='standard'
					className={`input-field ${classes.customTextField}`}
					onKeyDown={(e) => {
						if (e.key === 'Enter') handleAddItem()
					}}
					InputProps={{
						endAdornment: <LinkWithIcon name={IconParkNames.add} onClick={handleAddItem} />,
					}}
					sx={{
						mb: 2,
					}}
				/>
			</CardContent>
		</Card>
	)
}

export default memo(ListSearch)