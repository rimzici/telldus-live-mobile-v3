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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Image } from 'react-native';
import View from './View';

type Props = {
	children?: any,
	source?: number,
	appLayout: Object,
};

type DefaultProps = {
	source: number,
};

class Poster extends Component<Props, null> {
	props: Props;

	static propTypes = {
		children: PropTypes.any,
		source: PropTypes.number,
	};

	static defaultProps: DefaultProps = {
		source: require('../App/Components/TabViews/img/telldus-geometric-header-bg.png'),
	};

	constructor(props: Props) {
		super(props);
	}

	render(): Object {
		const { children, source, appLayout } = this.props;
		const { image, mask } = this._getStyle(appLayout);

		return (
			<View style={mask}>
				<Image source={source} style={image}/>
				{!!children && children}
			</View>
		);
	}

	_getStyle = (appLayout: Object): Object => {
		const height = appLayout.height;
		const width = appLayout.width;
		const isPortrait = height > width;

		return {
			image: {
				flex: 1,
				height: undefined,
				width: width,
				resizeMode: 'cover',
			},
			mask: {
				borderWidth: 0,
				height: isPortrait ? width * 0.333333333 : height * 0.333333333,
				width: width,
				overflow: 'hidden',
			},
		};
	};

}

function mapStateToProps(state, ownProps) {
	return {
		appLayout: state.App.layout,
	};
}

export default connect(mapStateToProps, null)(Poster);
