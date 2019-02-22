/**
 * Copyright 2016-present Telldus Technologies AB.
 *
 * This file is part of the Telldus Live! app.
 *
 * Telldus Live! app is free : you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Telldus Live! app is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Telldus Live! app.  If not, see <http://www.gnu.org/licenses/>.
 */

// @flow

'use strict';
import React from 'react';
import { Platform } from 'react-native';
import {
	VictoryChart,
	VictoryAxis,
	VictoryLine,
	VictoryTheme,
	VictoryScatter,
	VictoryZoomContainer,
} from 'victory-native';
import moment from 'moment';
const isEqual = require('react-fast-compare');

import { View } from '../../../../BaseComponents';

import shouldUpdate from '../../../Lib/shouldUpdate';
import Theme from '../../../Theme';
import _ from 'lodash';

type Props = {
	chartDataOne: Array<Object>,
	chartDataTwo: Array<Object>,
	selectedOne: Object,
	selectedTwo: Object,
	appLayout: Object,
	timestamp: Object,
	showOne: boolean,
	showTwo: boolean,
	smoothing: boolean,
	fullscreen: Object,

	max1: Object,
	max2: Object,
	min1: Object,
	min2: Object,
};

type DefaultProps = {
	showOne: boolean,
	showTwo: boolean,
	smoothing: boolean,
};

type State = {
	zoomDomain: Object,
};

class LineChart extends View<Props, null> {
	props: Props;
	state: State;
	static defaultProps: DefaultProps = {
		showOne: true,
		showTwo: true,
		smoothing: false,
	};

	getY: (Object) => number;
	getX: (Object) => number;
	formatXTick: (number) => string;
	onZoomDomainChange: (Object) => void;
	resetZoomDomainData: () => void;
	getEntireDomain: () => Object;
	renderAxis: (Array<Object>, number, Object) => Object;
renderLine: (Array<Object>, number, Object) => Object;

constructor(props: Props) {
	super(props);

	this.state = {
		zoomDomain: {},
	};
	this.getY = this.getY.bind(this);
	this.getX = this.getX.bind(this);
	this.formatXTick = this.formatXTick.bind(this);
	this.renderAxis = this.renderAxis.bind(this);
	this.renderLine = this.renderLine.bind(this);
	this.onZoomDomainChange = this.onZoomDomainChange.bind(this);
	this.resetZoomDomainData = this.resetZoomDomainData.bind(this);
	this.getEntireDomain = this.getEntireDomain.bind(this);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

	const propsChange = shouldUpdate(this.props, nextProps, [
		'showOne', 'showTwo', 'smoothing', 'fullscreen',
	]);
	if (propsChange) {
		return propsChange;
	}

	const { selectedOne, selectedTwo } = this.props;
	const isSelectedEqual = isEqual(selectedOne, nextProps.selectedOne) && isEqual(selectedTwo, nextProps.selectedTwo);
	if (!isSelectedEqual) {
		return true;
	}
	const { timestamp } = this.props;
	const isTimestampEqual = isEqual(timestamp, nextProps.timestamp);
	if (!isTimestampEqual) {
		return true;
	}
	const isLayoutEqual = nextProps.appLayout.width === this.props.appLayout.width;
	if (!isLayoutEqual) {
		return true;
	}

	const isDataOneEqual = nextProps.chartDataOne.length === this.props.chartDataOne.length;
	if (!isDataOneEqual) {
		return true;
	}
	const isDataTwoEqual = nextProps.chartDataTwo.length === this.props.chartDataTwo.length;
	if (!isDataTwoEqual) {
		return true;
	}

	return true;
}

getTickConfigX(): Object {
	const { fromTimestamp, toTimestamp } = this.props.timestamp;
	const from = moment.unix(fromTimestamp);
	const to = moment.unix(toTimestamp);
	const domainX = Math.abs(from.diff(to, 'days'));

	let ticks = [], day = from;
	ticks.push(fromTimestamp);
	for (let i = 1; i <= domainX; i++) {
		let d = day.add(1, 'd');
		ticks.push(d.unix());
	}
	return { ticks };
}

getY(data: Object): number {
	return data.value;
}

getX(data: Object): number {
	return data.ts;
}

formatXTick(tick: number): string {
	return `${moment.unix(tick).format('D')}/${moment.unix(tick).format('M')}`;
}

renderAxis(d: Array<Object>, i: number, styles: Object): null | Object {
	const {
		showOne,
		showTwo,
	} = this.props;

	if (!d || d.length === 0) {
		return null;
	}
	if (!showOne && i === 0) {
		return null;
	}
	if (!showTwo && i === 1) {
		return null;
	}

	const {
		xOffsets,
		tickPadding,
		anchors,
		chartLineStyle,
	} = styles;

	return (
		<VictoryAxis dependentAxis
			key={i}
			offsetX={xOffsets[i]}
			style={{
				axis: chartLineStyle,
				ticks: { padding: tickPadding[i] },
				tickLabels: { fill: Theme.Core.inactiveTintColor, textAnchor: anchors[i] },
				grid: chartLineStyle,
			}}
			tickCount={3}
		/>
	);
}

renderLine(d: Array<Object>, i: number, styles: Object): null | Object {
	const {
		showOne,
		showTwo,
		smoothing,
	} = this.props;

	if (!d || d.length === 0) {
		return null;
	}
	if (!showOne && i === 0) {
		return null;
	}
	if (!showTwo && i === 1) {
		return null;
	}

	const {
		colors,
	} = styles;

	if (d.length === 1) {
		return (
			<VictoryScatter
				key={i}
				data={d}
				style={{ data: { fill: colors[i] } }}
				y={this.getY}
				x={this.getX}
			/>
		);
	}

	return (<VictoryLine
		interpolation={smoothing ? 'monotoneX' : 'linear'}
		key={i}
		data={d}
		style={{ data: { stroke: colors[i] } }}
		y={this.getY}
		x={this.getX}
	/>);
}

getEntireDomain(): null | Object {
	const { chartDataOne, chartDataTwo } = this.props;
	const data = Array.from(chartDataOne).concat(chartDataTwo);
	return {
		y: [_.minBy(data, (d: Object): number => d.value).value, _.maxBy(data, (d: Object): number => d.value).value],
		x: [_.minBy(data, (d: Object): number => d.ts).ts - 0.9, _.maxBy(data, (d: Object): number => d.ts).ts - 0.9],
	};
}

onZoomDomainChange(zoomDomainData: Object) {
	this.setState({ zoomDomain: zoomDomainData });
}

resetZoomDomainData() {
	this.setState({
		zoomDomain: this.getEntireDomain(),
	});
}

render(): Object | null {
	const {
		chartDataOne,
		chartDataTwo,
	} = this.props;

	if (chartDataOne.length === 0 && chartDataTwo.length === 0) {
		return null;
	}

	const styles = this.getStyle();
	const {
		chartWidth,
		chartHeight,
		chartLineStyle,
		domainPadding,
		chartPadding,
		...others
	} = styles;

	const { zoomDomain } = this.state;

	const { ticks } = this.getTickConfigX();

	const axisOne = this.renderAxis(chartDataOne, 0, styles);
	const axisTwo = this.renderAxis(chartDataTwo, 1, styles);

	const lineOne = this.renderLine(chartDataOne, 0, others);
	const lineTwo = this.renderLine(chartDataTwo, 1, others);

	return (
		<VictoryChart
			theme={VictoryTheme.material}
			width={chartWidth} height={chartHeight}
			padding={chartPadding}
			domainPadding={{ y: domainPadding, x: 20 }}
			containerComponent={
				<VictoryZoomContainer
					onZoomDomainChange={this.onZoomDomainChange}
					zoomDomain={zoomDomain}
				/>
			}
		>
			<VictoryAxis
				orientation={'bottom'}
				style={{
					parent: {
						border: '0px',
					},
					axis: chartLineStyle,
					tickLabels: { fill: Theme.Core.inactiveTintColor },
					grid: chartLineStyle,
				}}
				tickValues={ticks}
				tickFormat={this.formatXTick}
			/>
			{axisOne}
			{axisTwo}
			{lineOne}
			{lineTwo}
		</VictoryChart>
	);
}

getStyle(): Object {
	const { appLayout, fullscreen } = this.props;
	const { show, force } = fullscreen;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { paddingFactor, brandDanger, brandInfo, inactiveTintColor } = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const outerPadding = padding * 2;
	// In Android, on force show full screen orientation is locked to 'LANDSCAPE'
	// So use 'height' on in IOS
	const chartWidth = (Platform.OS === 'ios' && show && force && isPortrait) ? height - outerPadding : width - outerPadding;
	const domainPadding = chartWidth * 0.05;

	const top = 25, bottom = 30;
	const chartPadding = {
		left: 0, top, right: 0, bottom,
	};

	const chartHeight = show ? deviceWidth - (top + bottom + outerPadding)
		:
		isPortrait ? chartWidth * 0.8 : chartWidth * 0.4;

	return {
		chartWidth,
		chartHeight,
		padding,
		xOffsets: [0, chartWidth],
		tickPadding: [-20, 5],
		anchors: ['start', 'start'],
		colors: [brandDanger, brandInfo],
		colorsScatter: [brandDanger, brandInfo],
		chartPadding,
		domainPadding,
		chartLineStyle: {
			strokeDasharray: '',
			strokeWidth: 0.9,
			strokeOpacity: 0.25,
			fill: inactiveTintColor,
			stroke: inactiveTintColor,
			pointerEvents: 'painted',
		},
	};
}
}

export default LineChart;
