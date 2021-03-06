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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import View from './View';
import IconTelldus from './IconTelldus';
import Theme from '../App/Theme';

type DefaultProps = {
	color: string,
	bgColor: string,
	backgroundMask: boolean,
};

type Props = {
	icon?: string,
	size?: number,
	color?: string,
	bgColor?: string,
	style?: number | Object | Array<any>,
	containerStyle?: number | Object | Array<any>,
	backgroundMask?: boolean,
	backgroundMaskStyle?: number | Object | Array<any>,
};

export default class BlockIcon extends Component<Props, null> {
	props: Props;

	static propTypes = {
		icon: PropTypes.string.isRequired,
		size: PropTypes.number,
		color: PropTypes.string,
		bgColor: PropTypes.string,
		style: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
		containerStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
		backgroundMaskStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
	};

	static defaultProps: DefaultProps = {
		color: '#fff',
		bgColor: Theme.Core.brandPrimary,
		backgroundMask: false,
	};

	render(): Object {
		const { style, containerStyle, icon, size, color, backgroundMask, backgroundMaskStyle } = this.props;
		const defaultStyle = this._getDefaultStyle();

		return (
			<View style={[defaultStyle, containerStyle]}>
				{backgroundMask && (<View style={backgroundMaskStyle}/>)}
				<IconTelldus icon={icon} size={size} color={color} style={style}/>
			</View>
		);
	}

	_getDefaultStyle = (): Object => {
		return {
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: this.props.bgColor,
		};
	};
}
