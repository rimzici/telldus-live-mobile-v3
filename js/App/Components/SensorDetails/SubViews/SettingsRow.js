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

import { Text, View, Switch } from '../../../../BaseComponents';
import Theme from '../../../Theme';

type Props = {
    value: boolean,
    label: string,
    appLayout: Object,
	onValueChange: (boolean) => void,
	type?: 'switch' | 'text',
};

type DefaultProps = {
	type: 'switch' | 'text',
};


class SettingsRow extends View<Props, null> {
	props: Props;

	static defaultProps: DefaultProps = {
		type: 'switch',
	}

	constructor(props: Props) {
		super(props);
	}

	render(): Object {
		let { appLayout, label, value, onValueChange, type } = this.props;

		let {
			ShowOnDashCover,
			textShowOnDashCover,
			textShowOnDash,
			valueText,
		} = this.getStyle(appLayout);

		return (
			<View style={ShowOnDashCover}>
				<View style={textShowOnDashCover}>
					<Text style={textShowOnDash}>
						{label}
					</Text>
				</View>
				{type === 'switch' ?
					<Switch
						onValueChange={onValueChange}
						value={value}
					/>
					:
					<Text style={valueText}>
						{value}
					</Text>
				}
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { inactiveTintColor, paddingFactor } = Theme.Core;

		const padding = deviceWidth * paddingFactor;
		const fontSize = deviceWidth * 0.04;

		return {
			ShowOnDashCover: {
				backgroundColor: '#fff',
				padding: fontSize,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				marginTop: padding / 2,
				...Theme.Core.shadow,
			},
			textShowOnDashCover: {
				alignItems: 'flex-start',
				justifyContent: 'center',
			},
			textShowOnDash: {
				color: '#000',
				fontSize,
				marginLeft: 8,
				justifyContent: 'center',
			},
			learn: {
				marginHorizontal: width * 0.25,
				marginVertical: padding / 2,
			},
			valueText: {
				fontSize,
				color: inactiveTintColor,
			},
		};
	}
}

module.exports = SettingsRow;
