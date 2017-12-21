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
 * @providesModule DeviceDetailsTabsView
 */

// @flow

'use strict';

import React from 'react';
import { StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';
import { TabNavigator } from 'react-navigation';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icon_settings from '../TabViews/img/selection.json';
const CustomIcon = createIconSetFromIcoMoon(icon_settings);

import DeviceDetailsTabView from 'DeviceDetailsTabView';
import { Text, View } from 'BaseComponents';
import { getWindowDimensions } from 'Lib';

type Props = {
	dispatch: Function,
	device: Object,
	stackNavigator: Object,
	intl: intlShape.isRequired,
	appOrientation: string,
	appLayout: Object,
};

type State = {
	currentTab: string,
};

class DeviceDetailsTabsView extends View {
	props: Props;
	state: State;

	goBack: () => void;
	onNavigationStateChange: (Object, Object) => void;
	getRouteName: (Object) => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			currentTab: 'Overview',
		};
		this.goBack = this.goBack.bind(this);
		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);

		this.isTablet = DeviceInfo.isTablet();
	}

	goBack() {
		this.props.stackNavigator.goBack();
	}

	getRouteName(navigationState) {
		if (!navigationState) {
			return null;
		}
		const route = navigationState.routes[navigationState.index];
		// dive into nested navigators
		if (route.routes) {
			return this.getRouteName(route);
		}
		return route.routeName;
	}

	onNavigationStateChange(prevState, currentState) {
		const currentScreen = this.getRouteName(currentState);
		this.setState({
			currentTab: currentScreen,
		});
	}

	render() {
		let { appOrientation, appLayout } = this.props;
		let screenProps = {
			device: this.props.device,
			currentTab: this.state.currentTab,
			intl: this.props.intl,
		};
		let isPortrait = appOrientation === 'PORTRAIT';

		let {
			poster,
			iconBackground,
			deviceIcon,
			textDeviceName,
		} = this.getStyles(isPortrait, appLayout);

		return (
			<View style={styles.container}>
				<ImageBackground style={poster} resizeMode={'cover'} source={require('../TabViews/img/telldus-geometric-header-bg.png')}>
					{(!this.isTablet) && (!isPortrait) &&
						<TouchableOpacity
							style={styles.backButtonLand}
							onPress={this.goBack}>
							<Icon name="arrow-back" size={appLayout.width * 0.0323} color="#fff"/>
						</TouchableOpacity>
					}
					<View style={iconBackground}>
						<CustomIcon name="icon_device_alt" size={deviceIcon.size} color={'#F06F0C'} />
					</View>
					<Text style={textDeviceName}>
						{this.props.device.name}
					</Text>
				</ImageBackground>
				<View style={{flex: 1}}>
					<Tabs screenProps={screenProps} onNavigationStateChange={this.onNavigationStateChange} />
				</View>
			</View>
		);
	}

	getStyles(isPortrait: boolean, appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		return {
			poster: {
				height: height * 0.2,
				width: width,
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: isPortrait ? 'column' : 'row',
			},
			iconBackground: {
				backgroundColor: '#fff',
				alignItems: 'center',
				justifyContent: 'center',
				width: isPortrait ? height * 0.12 : height * 0.10,
				height: isPortrait ? height * 0.12 : height * 0.10,
				borderRadius: isPortrait ? height * 0.06 : height * 0.05,
				marginRight: isPortrait ? 0 : 10,
			},
			deviceIcon: {
				size: isPortrait ? height * 0.08 : height * 0.06,
			},
			textDeviceName: {
				fontSize: isPortrait ? width * 0.05 : height * 0.05,
				color: '#fff',
			},
		};
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	backButtonLand: {
		position: 'absolute',
		alignItems: 'flex-start',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		left: 10,
		top: 10,
	},
});

const Tabs = TabNavigator(
	{
		Overview: {
			screen: DeviceDetailsTabView.Overview,
		},
		History: {
			screen: DeviceDetailsTabView.History,
		},
		Settings: {
			screen: DeviceDetailsTabView.Settings,
		},
	},
	{
		initialRouteName: 'Overview',
		tabBarOptions: {
			indicatorStyle: {
				backgroundColor: '#fff',
			},
			style: {
				backgroundColor: '#fff',
				shadowColor: '#000000',
				shadowOpacity: 1.0,
				elevation: 2,
				height: getWindowDimensions().height * 0.085,
				alignItems: 'center',
				justifyContent: 'center',
			},
			tabStyle: {
				width: getWindowDimensions().width / 3,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
			},
			swipeEnabled: true,
			lazy: true,
			animationEnabled: true,
			upperCaseLabel: false,
			scrollEnabled: true,
			activeTintColor: '#F06F0C',
			inactiveTintColor: '#A59F9A',
			showIcon: true,
		},
	}
);

function mapStateToProps(store: Object, ownProps: Object): Object {
	return {
		stackNavigator: ownProps.navigation,
		device: store.devices.byId[ownProps.navigation.state.params.id],
		appOrientation: store.App.orientation,
		appLayout: store.App.layout,
	};
}
function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(DeviceDetailsTabsView));
