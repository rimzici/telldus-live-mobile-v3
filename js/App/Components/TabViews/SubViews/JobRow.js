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
import { Image, Text, View } from 'react-native';
import { BlockIcon, IconTelldus, Row } from 'BaseComponents';
import Theme from 'Theme';
import getDeviceWidth from '../../../Lib/getDeviceWidth';
import TextRowWrapper from '../../Schedule/SubViews/TextRowWrapper';
import Title from '../../Schedule/SubViews/Title';
import Description from '../../Schedule/SubViews/Description';
import { ACTIONS } from '../../Schedule/SubViews/ActionRow';
import { getSelectedDays, getWeekdays, getWeekends } from '../../../Lib/getDays';
import { DAYS } from 'Constants';
import _ from 'lodash';
import capitalize from '../../../Lib/capitalize';

const methodNames = {
	[1]: 'On',
	[2]: 'Off',
	[4]: 'Bell',
	[16]: 'Dim',
	[32]: 'Learn',
	[128]: 'Up',
	[256]: 'Down',
	[512]: 'Stop',
};

type Props = {
	active: boolean,
	device: Object,
	method: number,
	methodValue: number,
	effectiveHour: string,
	effectiveMinute: string,
	offset: number,
	randomInterval: number,
	type: string,
	weekdays: number[],
	isFirst: boolean,
};

export default class JobRow extends View<null, Props, null> {

	static propTypes = {
		active: PropTypes.bool.isRequired,
		device: PropTypes.object.isRequired,
		method: PropTypes.number.isRequired,
		methodValue: PropTypes.number.isRequired,
		effectiveHour: PropTypes.string.isRequired,
		effectiveMinute: PropTypes.string.isRequired,
		offset: PropTypes.number.isRequired,
		randomInterval: PropTypes.number.isRequired,
		type: PropTypes.string.isRequired,
		weekdays: PropTypes.arrayOf(PropTypes.number).isRequired,
		isFirst: PropTypes.bool.isRequired,
	};

	render() {
		if (!this.props.device) {
			return null;
		}

		const { type, effectiveHour, effectiveMinute, device, offset, randomInterval } = this.props;
		const {
			container,
			wrapper,
			timeTypeContainer,
			timeTypeIcon,
			time,
			rowWrapper,
			triangleContainer,
			triangleCommon,
			triangleShadow,
			triangle,
			rowContainer,
			row,
			textWrapper,
			title,
			description,
			iconOffset,
			iconRandom,
		} = this._getStyle();
		const repeat = this._getRepeatDescription();

		return (
			<View style={container}>
				<View style={wrapper}>
					<BlockIcon
						icon={type}
						containerStyle={timeTypeContainer}
						style={timeTypeIcon}
					/>
					<Text style={time}>
						{`${effectiveHour}:${effectiveMinute}`}
					</Text>
					<View style={rowWrapper}>
						<View style={triangleContainer}>
							<Image
								source={require('../img/triangle-shadow.png')}
								style={[triangleCommon, triangleShadow]}
							/>
							<Image
								source={require('../img/triangle.png')}
								style={[triangleCommon, triangle]}
							/>
						</View>
						<Row layout="row" containerStyle={rowContainer} style={row}>
							{this._renderActionIcon()}
							<TextRowWrapper style={textWrapper}>
								<Title numberOfLines={1} ellipsizeMode="tail" style={title}>
									{device.name}
								</Title>
								<Description numberOfLines={1} ellipsizeMode="tail" style={description}>
									{repeat}
								</Description>
							</TextRowWrapper>
							{!!offset && (
								<IconTelldus
									icon="offset"
									style={iconOffset}
								/>
							)}
							{!!randomInterval && (
								<IconTelldus
									icon="random"
									style={iconRandom}
								/>
							)}
						</Row>
					</View>
				</View>
			</View>
		);
	}

	_renderActionIcon = (): Object | null => {
		const action = ACTIONS.find((a: Object): boolean => a.method === this.props.method);
		const { methodIconContainer, methodIcon } = this._getStyle();

		if (action) {
			if (action.name === 'Dim') {
				return (
					<View style={methodIconContainer}>
						<Text style={methodIcon}>
							{`${Math.round(this.props.methodValue / 255 * 100)}%`}
						</Text>
					</View>
				);
			}
			return (
				<BlockIcon
					icon={action.icon}
					bgColor={action.bgColor}
					containerStyle={methodIconContainer}
					style={methodIcon}
				/>
			);
		}

		return null;
	};

	_getRepeatDescription = (): string => {
		const { type, effectiveHour, effectiveMinute, weekdays } = this.props;
		const selectedDays: string[] = getSelectedDays(weekdays);

		let repeatDays: string = '';

		if (selectedDays.length === DAYS.length) {
			repeatDays = 'Every day';
		} else if (_.isEqual(selectedDays, getWeekdays())) {
			repeatDays = 'Every weekdays';
		} else if (_.isEqual(selectedDays, getWeekends())) {
			repeatDays = 'Every weekends';
		} else {
			for (let day of selectedDays) {
				repeatDays += `${day.slice(0, 3).toLowerCase()}, `;
			}
			repeatDays = capitalize(repeatDays.slice(0, -2));
		}

		const repeatTime: string = (type === 'time') ? `${effectiveHour}:${effectiveMinute}` : type;

		return `${repeatDays} at ${repeatTime}`;
	};

	_getStyle = (): Object => {
		const { active, isFirst, method } = this.props;
		const { fonts, borderRadiusRow } = Theme.Core;
		const deviceWidth = getDeviceWidth();

		const timeTypeIconWidth = deviceWidth * 0.061333333;
		const padding = deviceWidth * 0.013333333;

		let backgroundColor;
		const action = ACTIONS.find((a: Object): boolean => a.method === method);
		if (action) {
			backgroundColor = action.bgColor;
		}

		const triangleWidth = deviceWidth * 0.022666667;
		const triangleHeight = deviceWidth * 0.025333334;

		return {
			container: {
				flexDirection: 'row',
				alignItems: 'center',
			},
			line: {
				backgroundColor: '#929292',
				height: '100%',
				width: 1,
				position: 'absolute',
				left: deviceWidth * 0.029333333,
				top: 0,
				zIndex: -1,
			},
			wrapper: {
				flexDirection: 'row',
				alignItems: 'center',
				paddingTop: isFirst ? deviceWidth * 0.037333333 : padding,
				paddingBottom: padding,
				opacity: active ? 1 : 0.5,
			},
			timeTypeContainer: {
				backgroundColor: '#929292',
				aspectRatio: 1,
				width: timeTypeIconWidth,
				borderRadius: timeTypeIconWidth / 2,
			},
			timeTypeIcon: {
				color: '#fff',
				fontSize: deviceWidth * 0.044,
			},
			time: {
				color: '#555',
				fontSize: Math.floor(deviceWidth * 0.046666667),
				fontFamily: fonts.robotoMedium,
				marginHorizontal: deviceWidth * 0.033333333,
			},
			rowWrapper: {
				flexDirection: 'row',
				alignItems: 'center',
				width: deviceWidth * 0.674666667,
			},
			triangleContainer: {
				width: triangleWidth,
				height: triangleHeight,
				zIndex: 3,
			},
			triangleCommon: {
				width: triangleWidth,
				height: triangleHeight,
				position: 'absolute',
				right: 0,
				top: 0,
			},
			triangleShadow: {
				zIndex: -1,
			},
			triangle: {
				zIndex: 1,
				tintColor: backgroundColor,
			},
			rowContainer: {
				height: null,
				marginBottom: 0,
				width: deviceWidth * 0.650666667,
			},
			row: {
				alignItems: 'stretch',
			},
			methodIconContainer: {
				backgroundColor,
				borderTopLeftRadius: borderRadiusRow,
				borderBottomLeftRadius: borderRadiusRow,
				alignItems: 'center',
				justifyContent: 'center',
				width: deviceWidth * 0.16,
			},
			methodIcon: {
				color: '#fff',
				fontSize: action && action.name === 'Dim' ? deviceWidth * 0.04 : deviceWidth * 0.056,
			},
			textWrapper: {
				flex: 1,
				paddingLeft: deviceWidth * 0.032,
				paddingRight: deviceWidth * 0.068,
				width: null,
			},
			title: {
				color: '#707070',
				fontSize: deviceWidth * 0.04,
				fontFamily: fonts.robotoRegular,
				marginBottom: deviceWidth * 0.008,
			},
			description: {
				color: '#707070',
				fontSize: deviceWidth * 0.032,
				opacity: 1,
			},
			iconOffset: {
				position: 'absolute',
				right: deviceWidth * 0.014666667,
				top: deviceWidth * 0.016,
			},
			iconRandom: {
				position: 'absolute',
				right: deviceWidth * 0.014666667,
				bottom: deviceWidth * 0.016,
			},
		};
	};

}
