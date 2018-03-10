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
import PropTypes from 'prop-types';
import { Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';

import { Poster, View, Text } from '../../../../BaseComponents';
import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
	h1: string,
	h2: string,
	infoButton?: Object,
	screenProps: Object,
	navigation: Object,
	intl: Object,
	appLayout: Object,
};

export default class SchedulePoster extends View<null, Props, null> {

	goBack: () => void;

	static propTypes = {
		h1: PropTypes.string.isRequired,
		h2: PropTypes.string.isRequired,
		infoButton: PropTypes.object,
	};

	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.intl;

		this.defaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
		this.labelLeftIcon = `${formatMessage(i18n.navigationBackButton)} .${this.defaultDescription}`;

		this.goBack = this.goBack.bind(this);
		this.isTablet = DeviceInfo.isTablet();
	}

	goBack() {
		let { screenProps, navigation } = this.props;
		if (screenProps.currentScreen === screenProps.initialRouteName) {
			screenProps.rootNavigator.goBack();
		} else {
			navigation.goBack();
		}
	}

	render(): React$Element<any> {
		const { h1, h2, infoButton, appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const style = this._getStyle(appLayout);

		return (
			<Poster>
				{(!this.isTablet) && (!isPortrait) &&
						<TouchableOpacity
							style={style.backButtonLand}
							onPress={this.goBack}
							accessibilityLabel={this.labelLeftIcon}>
							<Icon name="arrow-back" size={width * 0.047} color="#fff" style={style.iconLeft}/>
						</TouchableOpacity>
				}
				<View style={style.hContainer}>
					<Text style={[style.h, style.h1]}>
						{h1}
					</Text>
					<Text style={[style.h, style.h2]}>
						{h2}
					</Text>
				</View>
				{!!infoButton && this._renderInfoButton(infoButton)}
			</Poster>
		);
	}

	_renderInfoButton = (button: Object): Object => {
		const { appLayout } = this.props;
		const { roundedInfoButtonContainer, roundedInfoButton } = this._getStyle(appLayout);

		return (
			<TouchableOpacity style={roundedInfoButtonContainer}>
				<Image
					source={require('../img/rounded-info-button.png')}
					style={roundedInfoButton}
				/>
			</TouchableOpacity>
		);
	};

	_getStyle = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const roundedInfoButtonSize = deviceWidth * 0.042666667;

		return {
			hContainer: {
				position: 'absolute',
				right: deviceWidth * 0.124,
				top: deviceWidth * 0.088,
				flex: 1,
				alignItems: 'flex-end',
			},
			h: {
				color: '#fff',
				backgroundColor: 'transparent',
				fontFamily: Theme.Core.fonts.robotoLight,
			},
			h1: {
				fontSize: deviceWidth * 0.085333333,
			},
			h2: {
				fontSize: deviceWidth * 0.053333333,
			},
			roundedInfoButtonContainer: {
				position: 'absolute',
				right: deviceWidth * 0.045333333,
				bottom: deviceWidth * 0.036,
			},
			roundedInfoButton: {
				height: roundedInfoButtonSize,
				width: roundedInfoButtonSize,
			},
			backButtonLand: {
				position: 'absolute',
				alignItems: 'flex-start',
				justifyContent: 'center',
				backgroundColor: 'transparent',
				left: 10,
				top: 10,
				zIndex: 1,
			},
			iconLeft: {
				paddingVertical: 10,
			},
		};
	};

}
