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

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { ScrollView } from 'react-native';
import { createSelector } from 'reselect';

import { I18n, List, ListDataSource, View } from 'BaseComponents';
import { JobRow, JobsPoster } from 'TabViews_SubViews';
import { getJobs } from 'Actions';

import { parseJobsForListView } from 'Reducers_Jobs';

import getTabBarIcon from '../../Lib/getTabBarIcon';
import getDeviceWidth from '../../Lib/getDeviceWidth';

type NavigationParams = {
	focused: boolean, tintColor: string,
};

type Props = {
	rowsAndSections: Object[],
	devices: Object,
	dispatch: Function,
};

type State = {
	daysToRender: React$Element<any>[],
};

class SchedulerTab extends View<null, Props, State> {

	static propTypes = {
		rowsAndSections: PropTypes.arrayOf(PropTypes.object),
	};

	static navigationOptions = {
		title: I18n.t('pages.scheduler'),
		tabBarIcon: ({ focused, tintColor }: NavigationParams): Object => {
			return getTabBarIcon(focused, tintColor, 'scheduler');
		},
	};

	constructor(props: Props) {
		super(props);

		this.state = {
			daysToRender: this._getDaysToRender(props.rowsAndSections.slice(0, 1)),
		};
	}

	componentDidMount() {
		setTimeout(() => {
			const remainingDaysToRender = this._getDaysToRender(this.props.rowsAndSections.slice(1));
			const daysToRender = this.state.daysToRender.concat(remainingDaysToRender);
			this.setState({ daysToRender });
		});
	}

	componentWillReceiveProps(nextProps: Props) {
		const { rowsAndSections } = nextProps;
		const daysToRender = this._getDaysToRender(rowsAndSections);
		this.setState({ daysToRender });
	}

	onRefresh = () => {
		this.props.dispatch(getJobs());
	};

	render() {
		return (
			<ScrollView
				horizontal={true}
				pagingEnabled={true}
				showsHorizontalScrollIndicator={false}
			>
				{this.state.daysToRender}
			</ScrollView>
		);
	}

	_getDaysToRender = (dataArray: Object[]): React$Element<any>[] => {
		const { container, line } = this._getStyle();

		return dataArray.map((section: Object): Object => {
			const dataSource = new ListDataSource(
				{
					rowHasChanged: this._rowHasChanged,
				},
			).cloneWithRows(section);

			return (
				<View>
					<JobsPoster/>
					<View style={container}>
						<View style={line}/>
						<List
							dataSource={dataSource}
							renderRow={this._renderRow}
							onRefresh={this.onRefresh}
						/>
					</View>
				</View>
			);
		});
	};

	_rowHasChanged = (r1: Object, r2: Object): boolean => {
		if (r1 === r2) {
			return false;
		}

		return (
			r1.effectiveHour !== r2.effectiveHour ||
			r1.effectiveMinute !== r2.effectiveMinute ||
			r1.method !== r2.method ||
			r1.deviceId !== r2.deviceId
		);
	};

	_renderRow = (props: Object, sectionId: number, rowId: string): React$Element<JobRow> => {
		return (
			<JobRow {...props} isFirst={+rowId === 0}/>
		);
	};

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();

		return {
			container: {
				flex: 1,
				paddingHorizontal: deviceWidth * 0.04,
				backgroundColor: '#fff',
			},
			line: {
				backgroundColor: '#929292',
				height: '100%',
				width: 1,
				position: 'absolute',
				left: deviceWidth * 0.069333333,
				top: 0,
				zIndex: -1,
			},
		};
	};

}

const getRowsAndSections = createSelector(
	[
		({ jobs }: { jobs: Object[] }): Object[] => jobs,
		({ gateways }: { gateways: Object }): Object => gateways,
		({ devices }: { devices: Object }): Object => devices,
	],
	(jobs: Object[], gateways: Object, devices: Object): Object[] => {
		const { sections, sectionIds } = parseJobsForListView(jobs, gateways, devices);

		const sectionObjects: Object[] = [];

		for (let i = 0; i < sectionIds.length; i++) {
			sectionObjects.push(
				sections[i].reduce((acc: Object, cur: Object, j: number): Object => {
					acc[j] = cur;
					return acc;
				}, {}),
			);
		}

		return sectionObjects;
	},
);

type MapStateToPropsType = {
	rowsAndSections: Object[],
	devices: Object,
};

const mapStateToProps = (store: Object): MapStateToPropsType => {
	return {
		rowsAndSections: getRowsAndSections(store),
		devices: store.devices,
	};
};

const mapDispatchToProps = (dispatch: Function): { dispatch: Function } => {
	return {
		dispatch,
	};
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(SchedulerTab);
