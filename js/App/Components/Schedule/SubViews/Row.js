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
import { View, Text } from 'BaseComponents';
import { Image, TouchableOpacity, Dimensions } from 'react-native';
import Theme from 'Theme';

type Props = {
	row: Object,
	width: number,
	marginBottom: number,
	select: (Object) => void,
	textColor: string,
	bgColor: string,
	iconSize: number,
};

class Row extends View {

	props: Props;

	select: () => void;

	constructor(props) {
		super(props);

		this.deviceWidth = Dimensions.get('window').width;

		const {
			textColor,
			bgColor,
			width,
			iconSize,
			marginBottom = this.deviceWidth * 0.026666667,
		} = this.props;

		const centerContent = {
			alignItems: 'center',
			justifyContent: 'center',
		};

		const borderRadius = 2;

		this.styles = {
			container: {
				flex: 1,
				height: this.deviceWidth * 0.209333333,
				minHeight: iconSize + 10,
				marginBottom,
				borderRadius: borderRadius,
				elevation: 2,
				shadowColor: '#000',
				shadowRadius: 2,
				shadowOpacity: 0.23,
				shadowOffset: {
					width: 0,
					height: 1,
				},
			},
			wrapper: {
				flex: 1,
				flexDirection: 'row',
			},
			icon: {
				container: {
					...centerContent,
					minWidth: iconSize,
					width: width * 0.3,
					backgroundColor: bgColor,
					padding: 5,
					borderTopLeftRadius: borderRadius,
					borderBottomLeftRadius: borderRadius,
				},
				image: {
					width: iconSize,
					height: iconSize,
				},
				font: {
					fontFamily: Theme.Core.fonts.telldusIconFont,
					fontSize: iconSize,
					color: '#fff',
				},
			},
			text: {
				container: {
					...centerContent,
					backgroundColor: '#fff',
					alignItems: 'flex-start',
					width: width * 0.7,
					paddingLeft: this.deviceWidth * 0.101333333,
					paddingRight: 10,
					paddingVertical: 5,
					borderTopRightRadius: borderRadius,
					borderBottomRightRadius: borderRadius,
				},
				name: {
					fontFamily: Theme.Core.fonts.sfnsDisplay,
					fontSize: this.deviceWidth * 0.053333333,
					color: textColor,
					marginBottom: this.deviceWidth * .008,
				},
				type: {
					fontFamily: Theme.Core.fonts.robotoRegular,
					fontSize: this.deviceWidth * 0.032,
					color: '#707070',
				},
			},
		};
	}

	select = () => {
		this.props.select(this.props.row);
	};

	render() {
		const { name, imageSource, description, icon } = this.props.row;

		return (
			<TouchableOpacity
				onPress={this.select}
				style={this.styles.container}
				outlineProvider="bounds"
			>
				<View style={this.styles.wrapper}>
					<View style={this.styles.icon.container}>
						{
							imageSource ? (
								<Image
									source={imageSource}
									style={this.styles.icon.image}
								/>
							) : (
								<Text style={this.styles.icon.font}>
									{icon}
								</Text>
							)
						}
					</View>
					<View style={this.styles.text.container}>
						<Text style={this.styles.text.name}>{name}</Text>
						<Text style={this.styles.text.type}>{description}</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	}
}

Row.propTypes = {
	row: React.PropTypes.object.isRequired,
	width: React.PropTypes.number.isRequired,
	marginBottom: React.PropTypes.number,
	select: React.PropTypes.func.isRequired,
};

module.exports = Row;
