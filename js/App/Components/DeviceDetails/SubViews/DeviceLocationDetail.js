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
import { connect } from 'react-redux';
import { Text, View } from '../../../../BaseComponents';
import { StyleSheet, Image, TouchableOpacity } from 'react-native';
import Theme from '../../../Theme';
import {
	getRelativeDimensions,
} from '../../../Lib';
type Props = {
	title?: any,
	image: string,
	H1: string,
	H2: string,
	style: any,
	onPress?: Function,
	appLayout: Object,
	accessible?: boolean,
	info?: Object,
};

type State = {
};

class DeviceLocationDetail extends View {
	props: Props;
	state: State;

	onPress: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
		};

		this.onPress = this.onPress.bind(this);
	}

	onPress() {
		if (this.props.onPress) {
			if (typeof this.props.onPress === 'function') {
				this.props.onPress();
			} else {
				console.warn('Invalid Prop Passed : onPress expects a Function.');
			}
		}
	}

	render(): Object {

		let { title, H1, H2, image, style, appLayout, accessible, info } = this.props;

		let {
			locationImageContainer,
			locationTextContainer,
			locationImage,
			textHSH,
			textLocation,
		} = this.getStyle(appLayout);

		return (
			<TouchableOpacity style={[styles.shadow, styles.container, style]} accessible={accessible}
				onPress={this.onPress}>
				{!!title && (
					<Text style={[textLocation, {marginLeft: 10}]}>
						{title}
					</Text>)
				}
				<View style={styles.imageHeaderContainer}>
					<View style={locationImageContainer}>
						<Image resizeMode={'contain'} style={locationImage} source={{ uri: image, isStatic: true }} />
					</View>
					<View style={locationTextContainer}>
						<Text numberOfLines={1} style={textHSH}>
							{!!H1 && H1}
						</Text>
						<Text numberOfLines={1} style={textLocation}>
							{!!H2 && H2}
						</Text>
						{info && (
							info
						)}
					</View>
				</View>
			</TouchableOpacity>
		);
	}

	getStyle(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		let isPortrait = height > width;

		return {
			locationImageContainer: {
				height: isPortrait ? height * 0.16 : width * 0.16,
				width: width * 0.25,
				justifyContent: 'center',
				alignItems: 'flex-start',
			},
			locationTextContainer: {
				height: isPortrait ? height * 0.16 : width * 0.16,
				width: width * 0.58,
				marginRight: width * 0.15,
				justifyContent: 'center',
				alignItems: 'flex-start',
			},
			locationImage: {
				width: isPortrait ? width * 0.22 : height * 0.22,
				height: isPortrait ? height * 0.12 : width * 0.12,
				alignSelf: 'flex-start',
			},
			textLocation: {
				color: '#A59F9A',
				fontSize: 14,
			},
			textHSH: {
				color: '#F06F0C',
				fontSize: 19,
			},
		};
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		backgroundColor: '#fff',
		paddingHorizontal: 10,
		paddingVertical: 10,
		marginVertical: 10,
		justifyContent: 'center',
	},
	imageHeaderContainer: {
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		flexDirection: 'row',
	},
	shadow: {
		borderRadius: 2,
		...Theme.Core.shadow,
	},
});

function mapStateToProps(store: Object): Object {
	return {
		appLayout: getRelativeDimensions(store.App.layout),
	};
}

module.exports = connect(mapStateToProps, null)(DeviceLocationDetail);
