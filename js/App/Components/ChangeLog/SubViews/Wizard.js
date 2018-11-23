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
 *
 */

// @flow

'use strict';

import React, { PureComponent } from 'react';
import { Platform, Animated } from 'react-native';
import { intlShape } from 'react-intl';

import { View, Text, IconTelldus, StyleSheet } from '../../../../BaseComponents';
import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
	intl: intlShape,
	currentScreen: number,
	animatedX: Object,
	animatedOpacity: Object,
	appLayout: Object,
};

export default class WizardOne extends PureComponent<Props, null> {
	props: Props;

	titleWOne: string;
	descriptionWOne: string;

	titleWTwo: string;
	descriptionWTwo: string;

	titleWThree: string;
	descriptionWThree: string;

	titleWFour: string;
	descriptionWFour: string;

	titleWFive: string;
	descriptionWFive: string;

	constructor(props: Props) {
		super(props);
		let { formatMessage } = props.intl;

		this.titleWOne = formatMessage(i18n.labelSensorHistory);
		this.descriptionWOne = formatMessage(i18n.wizardOneDescription38);

		this.titleWTwo = formatMessage(i18n.wizardTwoTitle38);
		this.descriptionWTwo = formatMessage(i18n.wizardTwoDescription38);

		this.titleWThree = formatMessage(i18n.labelDeviceTypes);
		this.descriptionWThree = formatMessage(i18n.wizardThreeDescription38);
	}

	getScreenData(currentScreen: number, deviceWidth: number): Object {
		let icon = null, iconTwo = null, iconThree = null, iconSize = Math.floor(deviceWidth * 0.315),
			iconTwoSize = Math.floor(deviceWidth * 0.315), iconThreeSize = Math.floor(deviceWidth * 0.315), title = '', description = '';
		switch (currentScreen) {
			case 1:
				icon = 'sensorhistory';
				title = this.titleWOne;
				description = this.descriptionWOne;
				return { icon, iconSize, iconTwoSize, iconThreeSize, title, description };
			case 2:
				icon = 'settings';
				title = this.titleWTwo;
				description = this.descriptionWTwo;
				return { icon, iconSize, iconTwoSize, iconThreeSize, title, description };
			case 3:
				icon = 'door-open';
				iconSize = Math.floor(deviceWidth * 0.345);
				title = this.titleWThree;
				description = this.descriptionWThree;
				return { icon, iconSize, iconTwoSize, iconThreeSize, title, description };
			case 4:
				icon = 'hidden';
				iconTwo = 'favorite-outline';
				iconTwoSize = Math.floor(deviceWidth * 0.22);
				iconThree = 'settings';
				iconThreeSize = Math.floor(deviceWidth * 0.22);
				title = this.titleWFour;
				description = this.descriptionWFour;
				return { icon, iconTwo, iconSize, iconTwoSize, iconThreeSize, iconThree, title, description };
			default:
				icon = 'time';
				title = this.titleWOne;
				description = this.descriptionWOne;
				return { icon, iconSize, iconTwoSize, iconThreeSize, title, description };
		}
	}

	render(): Object {
		const { currentScreen, animatedX, animatedOpacity, appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const { icon, iconTwo, iconThree, iconSize, iconTwoSize, iconThreeSize,
			title, description } = this.getScreenData(currentScreen, deviceWidth);

		const { container, titleStyle, descriptionStyle, iconTwoStyle, iconThreeStyle } = this.getStyles(appLayout);

		// IconTelldus, on setting different font sizes causing alignment issue. So, handling with negative margin.
		return (
			<Animated.View style={[container, {opacity: animatedOpacity, transform: [{
				translateX: animatedX,
			}]}]}>
				<View style={{flexDirection: 'row', justifyContent: 'center', marginLeft: iconTwo ? -16 : 0}}>
					{!!icon && <IconTelldus icon={icon} style={styles.icon} size={iconSize}/>}
					{!!iconTwo && <IconTelldus icon={iconTwo} style={iconTwoStyle} size={iconTwoSize}/>}
					{!!iconThree && <IconTelldus icon={iconThree} style={iconThreeStyle} size={iconThreeSize}/>}
				</View>
				<Text style={titleStyle}>
					{title}
				</Text>
				<Text style={descriptionStyle}>
					{description}
				</Text>
			</Animated.View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const titleFontSize = Math.floor(deviceWidth * 0.052);

		const iconFontSize = Math.floor(deviceWidth * 0.22);

		return {
			container: {
				...Theme.Core.shadow,
				backgroundColor: '#fff',
				justifyContent: 'center',
				alignItems: 'center',
				paddingHorizontal: titleFontSize,
				paddingVertical: titleFontSize,
				marginHorizontal: 10,
				marginVertical: 10,
			},
			// IconTelldus, on setting different font sizes causing alignment issue. So, handling with margin.
			iconTwoStyle: {
				color: Theme.Core.brandSecondary,
				textAlignVertical: 'center',
				marginTop: Platform.OS === 'ios' ? iconFontSize * 0.18 : 0,
				textAlign: 'center',
			},
			// IconTelldus, on setting different font sizes causing alignment issue. So, handling with margin.
			iconThreeStyle: {
				color: Theme.Core.brandSecondary,
				textAlignVertical: 'center',
				marginTop: Platform.OS === 'ios' ? iconFontSize * 0.18 : 0,
				marginLeft: iconFontSize * 0.18,
				textAlign: 'center',
			},
			titleStyle: {
				fontSize: titleFontSize,
				color: '#00000090',
				textAlign: 'center',
				marginVertical: 10,
			},
			descriptionStyle: {
				fontSize: Math.floor(deviceWidth * 0.042),
				color: '#00000080',
				textAlign: 'left',
			},
		};
	}
}
const styles = StyleSheet.create({
	icon: {
		color: Theme.Core.brandSecondary,
		textAlign: 'center',
	},
});

