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
 * @providesModule TabsView
 */

// @flow

'use strict';

import React from 'react';
import { TouchableOpacity, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import Orientation from 'react-native-orientation';
const orientation = Orientation.getInitialOrientation();

import { FormattedMessage, Text, View, Icon, Image, Header } from 'BaseComponents';
import i18n from '../../Translations/common';

import DrawerLayoutAndroid from 'DrawerLayoutAndroid';
import ExtraDimensions from 'react-native-extra-dimensions-android';

import { SettingsDetailModal } from 'DetailViews';
import TabBar from './TabBar';

import { getUserProfile } from '../../Reducers/User';
import { syncWithServer, switchTab, toggleEditMode, addNewGateway } from 'Actions';
import TabViews from 'TabViews';
import { hasStatusBar } from 'Lib';
import { TabNavigator } from 'react-navigation';

const messages = defineMessages({
	connectedLocations: {
		id: 'settings.connectedLocations',
		defaultMessage: 'Connected Locations',
	},
	addNewLocation: {
		id: 'settings.addNewLocation',
		defaultMessage: 'Add New Location',
	},
});

const AddLocation = ({onPress, styles}) => {
	return (
		<View style={styles.addNewLocationContainer}>
			<TouchableOpacity onPress={onPress} style={styles.addNewLocationCover}>
				<Icon name="plus-circle" size={20} color="#e26901"/>
				<FormattedMessage {...messages.addNewLocation} style={styles.addNewLocationText}/>
			</TouchableOpacity>
		</View>
	);
};

const Gateway = ({ name, online, websocketOnline, styles }) => {
	let locationSrc;
	if (!online) {
		locationSrc = require('./img/tabIcons/location-red.png');
	} else if (!websocketOnline) {
		locationSrc = require('./img/tabIcons/location-orange.png');
	} else {
		locationSrc = require('./img/tabIcons/location-green.png');
	}
	return (
		<View style={styles.gatewayContainer}>
			<Image style={styles.gatewayIcon} source={locationSrc}/>
			<Text style={styles.gateway} ellipsizeMode="middle" numberOfLines={1}>{name}</Text>
		</View>
	);
};

const NavigationHeader = ({ firstName, lastName, styles }) => (
	<View style={styles.navigationHeader}>
		<Image style={styles.navigationHeaderImage}
		       source={require('./img/telldus.png')}
		       resizeMode={'contain'}/>
		<View style={styles.navigationHeaderTextCover}>
			<Text numberOfLines={1} style={styles.navigationHeaderText}>
				{firstName}
			</Text>
			{lastName ?
				<Text numberOfLines={1} style={styles.navigationHeaderText}>
					{lastName}
				</Text>
				:
				null
			}
		</View>
	</View>
);

const ConnectedLocations = ({styles}) => (
	<View style={styles.navigationTitle}>
		<Image source={require('./img/tabIcons/router.png')} resizeMode={'contain'} style={styles.navigationTitleImage}/>
		<Text style={styles.navigationTextTitle}><FormattedMessage {...messages.connectedLocations} style={styles.navigationTextTitle}/></Text>
	</View>
);

const SettingsButton = ({ onPress, styles }) => (
	<TouchableOpacity onPress={onPress} style={styles.navigationTitle}>
		<Image source={require('./img/tabIcons/gear.png')} resizeMode={'contain'} style={styles.navigationTitleImage}/>
		<Text style={styles.navigationTextTitle}><FormattedMessage {...i18n.settingsHeader} style={styles.navigationTextTitle} /></Text>
	</TouchableOpacity>
);

const NavigationView = ({ gateways, userProfile, onOpenSetting, addNewLocation, styles }) => {
	return (
		<ScrollView style={{
			flex: 1,
		}}>
			<NavigationHeader firstName={userProfile.firstname} lastName={userProfile.lastname} styles={styles}/>
			<View style={{
				flex: 1,
				backgroundColor: 'white',
			}}>
				<ConnectedLocations styles={styles}/>
				{gateways.allIds.map((id, index) => {
					return (<Gateway {...gateways.byId[id]} key={index} styles={styles}/>);
				})}
				<AddLocation onPress={addNewLocation} styles={styles}/>
				<SettingsButton onPress={onOpenSetting} styles={styles}/>
			</View>
		</ScrollView>
	);
};

const RouteConfigs = {
	Dashboard: {
		screen: TabViews.Dashboard,
	},
	Devices: {
		screen: TabViews.Devices,
	},
	Sensors: {
		screen: TabViews.Sensors,
	},
	Scheduler: {
		screen: TabViews.Scheduler,
	},
};

const TabNavigatorConfig = {
	initialRouteName: 'Dashboard',
	swipeEnabled: true,
	lazy: true,
	animationEnabled: true,
	tabBarComponent: TabBar,
	tabBarPosition: 'top',
	tabBarOptions: {
		activeTintColor: '#fff',
		indicatorStyle: {
			backgroundColor: '#fff',
		},
		scrollEnabled: true,
	},
};

const Tabs = TabNavigator(RouteConfigs, TabNavigatorConfig);

type Props = {
	intl: intlShape.isRequired,
	dashboard: Object,
	tab: string,
	userProfile: Object,
	isAppActive: boolean,
	gateways: Object,
	syncGateways: () => void,
	onTabSelect: (string) => void,
	onToggleEditMode: (string) => void,
	dispatch: Function,
	stackNavigator: Object,
	addNewLocation: () => void,
};

type State = {
	settings: boolean,
	starIcon: Object,
};

class TabsView extends View {
	props: Props;
	state: State;

	renderNavigationView: () => Object;
	onOpenSetting: () => void;
	onCloseSetting: () => void;
	onTabSelect: (string) => void;
	onRequestChangeTab: (number) => void;
	toggleEditMode: (number) => void;
	openDrawer: () => void;
	onNavigationStateChange: (Object, Object) => void;
	addNewLocation: () => void;

	constructor(props: Props) {
		super(props);

		this.starButton = {
			icon: {
				name: 'star',
				size: 22,
				color: '#fff',
				style: null,
				iconStyle: null,
			},
			onPress: this.toggleEditMode,
		};

		this.menuButton = {
			icon: {
				name: 'bars',
				size: 22,
				color: '#fff',
				style: null,
				iconStyle: null,
			},
			onPress: this.openDrawer,
		};

		this.state = {
			settings: false,
			routeName: 'Dashboard',
			addingNewLocation: false,
			orientation,
		};

		this.renderNavigationView = this.renderNavigationView.bind(this);
		this.onOpenSetting = this.onOpenSetting.bind(this);
		this.onCloseSetting = this.onCloseSetting.bind(this);
		this.onTabSelect = this.onTabSelect.bind(this);
		this.onRequestChangeTab = this.onRequestChangeTab.bind(this);
		this.toggleEditMode = this.toggleEditMode.bind(this);
		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
		this.addNewLocation = this.addNewLocation.bind(this);

		this.orientationDidChange = this.orientationDidChange.bind(this);
	}

	componentDidMount() {
		Icon.getImageSource('star', 22, 'white').then((source) => this.setState({ starIcon: source }));
		Orientation.addOrientationListener(this.orientationDidChange);
	}

	orientationDidChange(deviceOrientation) {
		this.setState({
			orientation: deviceOrientation,
		});
	}

	componentWillUnmount() {
		Orientation.removeOrientationListener(this.orientationDidChange);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.gateways.allIds.length === 0 && !this.state.addingNewLocation && nextProps.gateways.toActivate.checkIfGatewaysEmpty) {
			this.addNewLocation();
		}
		if (nextProps.isAppActive && !this.props.isAppActive) {
			Orientation.getOrientation((error: any, deviceOrientation: string) => {
				if (deviceOrientation) {
					this.setState({
						orientation: deviceOrientation,
					});
				}
			});
		}
	}

	addNewLocation() {
		this.props.addNewLocation()
			.then(response => {
				if (response.client) {
					this.props.stackNavigator.navigate('AddLocation', {clients: response.client, renderRootHeader: true});
					this.setState({
						addingNewLocation: true,
					});
				}
			});
	}

	onTabSelect(tab) {
		if (this.props.tab !== tab) {
			this.props.onTabSelect(tab);
			if (this.refs.drawer) {
				this.refs.drawer.closeDrawer();
			}
		}
	}

	onOpenSetting() {
		this.setState({ settings: true });
	}

	onCloseSetting() {
		this.setState({ settings: false });
	}

	onRequestChangeTab(index) {
		this.setState({ index });
		const tabNames = ['dashboardTab', 'devicesTab', 'sensorsTab', 'schedulerTab'];
		this.onTabSelect(tabNames[index]);
	}

	onNavigationStateChange(prevState, currentState) {
		const index = currentState.index;

		this.setState({ routeName: currentState.routes[index].routeName });
		this.onRequestChangeTab(index);
	}

	openDrawer = () => {
		this.refs.drawer.openDrawer();
		this.props.syncGateways();
	};

	renderNavigationView(): Object {
		let { appLayout } = this.props;
		let styles = this.getStyles(appLayout);

		return <NavigationView
			gateways={this.props.gateways}
			addNewLocation={this.addNewLocation}
			userProfile={this.props.userProfile}
			theme={this.getTheme()}
			onOpenSetting={this.onOpenSetting}
			styles={styles}
		/>;
	}

	makeRightButton = (routeName: string, styles: Object): any => {
		this.starButton.icon.style = styles.starButtonStyle;
		this.starButton.icon.size = styles.buttonSize > 22 ? styles.buttonSize : 22;
		return (routeName === 'Devices' || routeName === 'Sensors') ? this.starButton : null;
	};

	makeLeftButton = (styles: Object): any => {
		this.menuButton.icon.style = styles.menuButtonStyle;
		this.menuButton.icon.iconStyle = styles.menuIconStyle;
		this.menuButton.icon.size = styles.buttonSize > 22 ? styles.buttonSize : 22;
		return this.menuButton;
	};

	getDrawerWidth = (deviceWidth: number): number => {
		let minWidth = 250;
		let width = deviceWidth * 0.6;
		return width < minWidth ? minWidth : width;
	}

	render() {

		let { appLayout } = this.props;
		let isPortrait = appLayout.height > appLayout.width;
		let deviceWidth = isPortrait ? appLayout.width : appLayout.height;
		let styles = this.getStyles(appLayout);

		let screenProps = {
			stackNavigator: this.props.stackNavigator,
			orientation: this.state.orientation,
			currentTab: this.state.routeName,
		};
		if (!this.state || !this.state.starIcon) {
			return false;
		}

		const { routeName } = this.state;

		const rightButton = this.makeRightButton(routeName, styles);
		const leftButton = this.makeLeftButton(styles);
		const drawerWidth = this.getDrawerWidth(deviceWidth);

		// TODO: Refactor: Split this code to smaller components
		return (
			<DrawerLayoutAndroid
				ref="drawer"
				drawerWidth={drawerWidth}
				drawerPosition={DrawerLayoutAndroid.positions.Left}
				renderNavigationView={this.renderNavigationView}
			>
				<View style={{flex: 1}}>
					<Header style={styles.header} logoStyle={styles.logoStyle} leftButton={leftButton} rightButton={rightButton}/>
					<View style={styles.container}>
						<Tabs screenProps={{...screenProps, intl: this.props.intl}} onNavigationStateChange={this.onNavigationStateChange}/>
						{
							this.state.settings ? (
								<SettingsDetailModal isVisible={true} onClose={this.onCloseSetting}/>
							) : null
						}
					</View>
				</View>
			</DrawerLayoutAndroid>
		);
	}

	getStyles(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		let isPortrait = height > width;
		let deviceHeight = isPortrait ? height : width;

		return {
			header: isPortrait ? {
				height: deviceHeight * 0.1111,
			} : {
				transform: [{rotateZ: '-90deg'}],
				position: 'absolute',
				left: -deviceHeight * 0.4444,
				top: deviceHeight * 0.4444,
				width: deviceHeight,
				height: deviceHeight * 0.1111,
			},
			container: {
				flex: 1,
				marginLeft: isPortrait ? 0 : deviceHeight * 0.11,
			},
			buttonSize: isPortrait ? Math.floor(width * 0.04) : Math.floor(height * 0.04),
			menuButtonStyle: isPortrait ? null : {
				position: 'absolute',
				left: deviceHeight * 0.8999,
				top: deviceHeight * 0.03666,
				paddingTop: 0,
				paddingHorizontal: 0,
			},
			starButtonStyle: isPortrait ? null : {
				position: 'absolute',
				right: deviceHeight * 0.5333,
				top: deviceHeight * 0.03666,
				paddingTop: 0,
				paddingHorizontal: 0,
			},
			menuIconStyle: isPortrait ? null : {
				transform: [{rotateZ: '90deg'}],
			},
			logoStyle: isPortrait ? null : {
				position: 'absolute',
				left: deviceHeight * 0.6255,
				top: deviceHeight * 0.0400,
			},

			navigationHeader: {
				height: deviceHeight * 0.18111,
				width: isPortrait ? width * 0.6 : height * 0.6,
				minWidth: 250,
				backgroundColor: 'rgba(26,53,92,255)',
				marginTop: hasStatusBar() ? ExtraDimensions.get('STATUS_BAR_HEIGHT') : 0,
				paddingBottom: ExtraDimensions.get('STATUS_BAR_HEIGHT'),
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'flex-end',
				paddingLeft: 10,
			},
			navigationHeaderImage: {
				width: 55,
				height: 57,
				padding: 5,
			},
			navigationHeaderText: {
				color: '#e26901',
				fontSize: 22,
				marginLeft: 10,
				marginTop: 4,
				zIndex: 3,
				alignItems: 'flex-end',
			},
			navigationHeaderTextCover: {
				flex: 1,
				flexDirection: 'row',
				flexWrap: 'wrap',
				height: 64,
				justifyContent: 'flex-start',
				alignItems: 'flex-end',
			},
			navigationTitle: {
				flexDirection: 'row',
				height: 30,
				marginLeft: 10,
				marginTop: 20,
				marginBottom: 10,
			},
			navigationTextTitle: {
				color: 'rgba(26,53,92,255)',
				fontSize: 18,
				marginLeft: 10,
			},
			navigationTitleImage: {
				width: 28,
				height: 28,
			},
			settingsButton: {
				padding: 6,
				minWidth: 100,
			},
			settingsText: {
				color: 'white',
				fontSize: 18,
			},
			gatewayContainer: {
				marginLeft: 10,
				height: 20,
				flexDirection: 'row',
				marginTop: 10,
				marginBottom: 10,
			},
			gateway: {
				fontSize: 14,
				color: 'rgba(110,110,110,255)',
				marginLeft: 10,
				maxWidth: 220,
			},
			gatewayIcon: {
				width: 20,
				height: 20,
			},
			addNewLocationCover: {
				flexDirection: 'row',
			},
			addNewLocationContainer: {
				borderBottomWidth: 1,
				borderBottomColor: '#eeeeef',
				marginLeft: 10,
				marginRight: 10,
				marginTop: 10,
				height: 40,
				justifyContent: 'flex-start',
			},
			addNewLocationText: {
				fontSize: 14,
				color: '#e26901',
				marginLeft: 10,
			},
		};
	}

	toggleEditMode = () => {
		this.props.onToggleEditMode(this.props.tab);
	};
}

function mapStateToProps(store, ownprops) {
	return {
		stackNavigator: ownprops.navigation,
		tab: store.navigation.tab,
		userProfile: getUserProfile(store),
		dashboard: store.dashboard,
		gateways: store.gateways,
		isAppActive: store.App.active,
		appLayout: store.App.layout,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		syncGateways: () => dispatch(syncWithServer('gatewaysTab')),
		onTabSelect: (tab) => {
			dispatch(syncWithServer(tab));
			dispatch(switchTab(tab));
		},
		onToggleEditMode: (tab) => dispatch(toggleEditMode(tab)),
		addNewLocation: () => {
			return dispatch(addNewGateway());
		},
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(TabsView));
