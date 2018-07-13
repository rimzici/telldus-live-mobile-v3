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
import { Dropdown } from 'react-native-material-dropdown';
import Ripple from 'react-native-material-ripple';

import { View, Text, IconTelldus } from '../../../../BaseComponents';

import Theme from '../../../Theme';

type Props = {
    selectedOne: Object,
	selectedTwo: Object,
	listOne: Array<string>,
    listTwo: Array<string>,
    onValueChangeOne: (string, number) => void,
	onValueChangeTwo: (string, number) => void,
	appLayout: Object,
};

type State = {
};

class GraphValuesDropDown extends View<Props, State> {
	props: Props;
	state: State;

	renderBaseOne: (Object) => Object;
	renderBaseTwo: (Object) => Object;
	onPressPickerOne: () => void;
	onPressPickerTwo: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
		};

		this.renderBaseOne = this.renderBaseOne.bind(this);
		this.renderBaseTwo = this.renderBaseTwo.bind(this);
		this.onPressPickerOne = this.onPressPickerOne.bind(this);
		this.onPressPickerTwo = this.onPressPickerTwo.bind(this);
	}

	renderBaseOne(items: Object): Object {
		const { data, title } = items;
		const { appLayout } = this.props;

		const {
			pickerBaseCoverStyle,
			pickerBaseTextStyle,
			leftIconStyle,
			rightIconStyle,
		} = this.getStyle(appLayout);
		const {icon} = data.find((item: Object): boolean => {
			return item.value === title;
		});
		return (
			<Ripple
				rippleColor={Theme.rippleColor}
				rippleOpacity={Theme.rippleOpacity}
				rippleDuration={Theme.rippleDuration}
				style={pickerBaseCoverStyle}
				onPress={this.onPressPickerOne}>
				<IconTelldus icon={icon} style={leftIconStyle}/>
				<Text style={pickerBaseTextStyle} numberOfLines={1}>
					{title}
				</Text>
				<IconTelldus icon={'down'} style={rightIconStyle}/>
			</Ripple>
		);
	}

	onPressPickerOne() {
		this.refs.listOne.focus();
	}

	onPressPickerTwo() {
		this.refs.listTwo.focus();
	}

	renderBaseTwo(items: Object): Object {
		const { data, title } = items;
		const { appLayout } = this.props;

		const {
			pickerBaseCoverStyle,
			pickerBaseTextStyle,
			leftIconStyle,
			rightIconStyle,
		} = this.getStyle(appLayout);
		const {icon} = data.find((item: Object): boolean => {
			return item.value === title;
		});

		return (
			<Ripple
				rippleColor={Theme.rippleColor}
				rippleOpacity={Theme.rippleOpacity}
				rippleDuration={Theme.rippleDuration}
				style={pickerBaseCoverStyle}
				onPress={this.onPressPickerTwo}>
				<IconTelldus icon={icon} style={leftIconStyle}/>
				<Text style={pickerBaseTextStyle} numberOfLines={1}>
					{title}
				</Text>
				<IconTelldus icon={'down'} style={rightIconStyle}/>
			</Ripple>
		);
	}

	render(): Object {
		const {
			selectedOne,
			selectedTwo,
			listOne,
			listTwo,
			onValueChangeOne,
			onValueChangeTwo,
			appLayout,
		} = this.props;

		const {
			dropDownContainerStyle,
			dropDownListsContainerStyle,
			pickerContainerStyle,
			fontSize,
			rowTextColor,
			dropDownHeaderStyle,
		} = this.getStyle(appLayout);

		return (
			<View style={dropDownContainerStyle}>
				<Text style={dropDownHeaderStyle}>Graph Values</Text>
				<View style={dropDownListsContainerStyle}>
					{listOne.length > 1 && (
						<Dropdown
							ref={'listOne'}
							data={listOne}
							value={selectedOne.value}
							onChangeText={onValueChangeOne}
							renderBase={this.renderBaseOne}
							containerStyle={pickerContainerStyle}
							fontSize={fontSize}
							baseColor={'#000'}
							itemColor={'#000'}
							selectedItemColor={rowTextColor}
							dropdownOffset={{top: -50, left: 0}}
						/>)}
					{listTwo.length > 1 && (
						<Dropdown
							ref={'listTwo'}
							data={listTwo}
							value={selectedTwo.value}
							onChangeText={onValueChangeTwo}
							renderBase={this.renderBaseTwo}
							containerStyle={pickerContainerStyle}
							fontSize={fontSize}
							baseColor={'#000'}
							itemColor={'#000'}
							selectedItemColor={rowTextColor}
							dropdownOffset={{top: -50, left: 0}}
						/>)}
				</View>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { shadow, paddingFactor, rowTextColor, inactiveTintColor } = Theme.Core;

		const padding = deviceWidth * paddingFactor;
		const outerPadding = padding * 2;
		const innerPadding = outerPadding / 2;
		const pickerItemsWidth = (deviceWidth - (outerPadding + innerPadding)) / 2;

		const fontSizeText = deviceWidth * 0.04;
		const fontSizeLeftIcon = deviceWidth * 0.057;
		const fontSizeRightIcon = deviceWidth * 0.04;

		return {
			dropDownContainerStyle: {
				flex: 0,
				alignItems: 'flex-start',
			},
			dropDownHeaderStyle: {
				marginLeft: padding / 2,
				color: inactiveTintColor,
				fontSize: fontSizeText * 1.2,
				marginBottom: (fontSizeText * 0.5),
			},
			dropDownListsContainerStyle: {
				flex: 0,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
			},
			pickerContainerStyle: {
				width: pickerItemsWidth,
				...shadow,
				marginLeft: padding / 2,
				marginBottom: padding / 2,
				backgroundColor: '#fff',
			},
			pickerBaseCoverStyle: {
				width: pickerItemsWidth,
				flexDirection: 'row',
				justifyContent: 'flex-start',
				alignItems: 'center',
				padding: 5 + (fontSizeText * 0.4),
			},
			pickerBaseTextStyle: {
				flex: 1,
				fontSize: fontSizeText,
				color: rowTextColor,
				marginRight: (fontSizeText * 0.4),
			},
			fontSize: fontSizeText,
			rowTextColor,
			leftIconStyle: {
				fontSize: fontSizeLeftIcon,
				color: rowTextColor,
				marginRight: (fontSizeText * 0.4),
			},
			rightIconStyle: {
				fontSize: fontSizeRightIcon,
				color: rowTextColor,
			},
		};
	}

}


module.exports = GraphValuesDropDown;
