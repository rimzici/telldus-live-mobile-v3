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
 *
 */

// @flow

'use strict';

import React from 'react';
import { StyleSheet, Dimensions, ScrollView } from 'react-native';
import Orientation from 'react-native-orientation';
const orientation = Orientation.getInitialOrientation();
import Theme from 'Theme';

import { View } from 'BaseComponents';
import Tabs from './Tabs';

const deviceHeight = orientation === 'PORTRAIT' ? Dimensions.get('screen').height : Dimensions.get('screen').width;
const deviceWidth = orientation === 'PORTRAIT' ? Dimensions.get('screen').width : Dimensions.get('screen').height;

type Props = {
	navigationState: Object,
	navigation: Object,
	screenProps: Object,
};

type State = {
};

export default class TabBar extends View {
	props: Props;
	state: State;

	orientationDidChange: (string) => void;
	renderTabs: (Object, number) => Object;
	scrollToTab: (number, number) => void;

	constructor(props: Props) {
		super(props);
		this.orientationDidChange = this.orientationDidChange.bind(this);

		this.state = {
			orientation,
		};

		this.renderTabs = this.renderTabs.bind(this);
		this.scrollToTab = this.scrollToTab.bind(this);
	}

	componentDidMount() {
		Orientation.addOrientationListener(this.orientationDidChange);
	}

	orientationDidChange(deviceOrientation: string) {
		this.setState({
			orientation: deviceOrientation,
		});
	}

	componentWillUnmount() {
		Orientation.removeOrientationListener(this.orientationDidChange);
	}

	scrollToTab(position: number, width: number) {
		let x = (position + width) - (deviceWidth);
		x = x < 0 ? 0 : x;
		this.refs.scrollView.scrollTo({x: x, y: undefined, animated: true});
	}

	renderTabs(tab: Object, index: number): Object {
		let { screenProps, navigation } = this.props;
		return (
			<Tabs key={index} onPress={this.scrollToTab} screenProps={screenProps} tab={tab} navigation={navigation}/>
		);
	}

	render() {
		let { navigationState } = this.props;
		let tabs = navigationState.routes.map((tab, index) => {
			return this.renderTabs(tab, index);
		});
		let containerStyle = this.state.orientation === 'PORTRAIT' ? styles.container : styles.containerOnLand;
		let scrollView = this.state.orientation === 'PORTRAIT' ? styles.scrollView : styles.scrollViewLand;
		return (
			<View style={scrollView}>
				<ScrollView
					ref="scrollView"
					contentContainerStyle={containerStyle}
					horizontal={this.state.orientation === 'PORTRAIT'}
					showsHorizontalScrollIndicator={false}
					overScrollMode="never"
				>
					{tabs}
				</ScrollView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 0,
		backgroundColor: Theme.Core.brandPrimary,
		...Theme.Core.shadow,
		zIndex: 1,
	},
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
		height: deviceHeight * 0.0777,
		zIndex: 1,
	},
	scrollViewLand: {
		top: 0,
		bottom: 0,
		position: 'absolute',
		backgroundColor: Theme.Core.brandPrimary,
		...Theme.Core.shadow,
		zIndex: 1,
	},
	containerOnLand: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'flex-start',
		width: deviceHeight * 0.0777,
		zIndex: 1,
	},
});
