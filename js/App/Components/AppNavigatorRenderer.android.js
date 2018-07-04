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
import { NetInfo } from 'react-native';
import Toast from 'react-native-simple-toast';
import DrawerLayoutAndroid from 'DrawerLayoutAndroid';
import { announceForAccessibility } from 'react-native-accessibility';

import {
	getUserProfile,
	appStart,
	appState,
	syncLiveApiOnForeground,
	getAppData,
	getGateways,
	hideToast,
	resetSchedule,
	autoDetectLocalTellStick,
	setAppLayout,
	resetLocalControlIP,
	showToast,
	addNewGateway,
	syncWithServer,
	switchTab,
} from '../Actions';
import {
	getRSAKey,
	getRelativeDimensions,
	setTopLevelNavigator,
	navigate,
	getDrawerWidth,
	getRouteName,
} from '../Lib';
import { intlShape, injectIntl, defineMessages } from 'react-intl';

import { View, Header, IconTelldus } from '../../BaseComponents';
import Navigator from './AppNavigator';
import { DimmerPopup } from './TabViews/SubViews';
import DimmerStep from './TabViews/SubViews/Device/DimmerStep';
import UserAgreement from './UserAgreement/UserAgreement';
import Drawer from './Drawer/Drawer';

import { hideDimmerStep } from '../Actions/Dimmer';
import { getUserProfile as getUserProfileSelector } from '../Reducers/User';

import i18n from '../Translations/common';
// TODO : Remove unused strings!
const messages = defineMessages({
	errortoast: {
		id: 'errortoast',
		defaultMessage: 'Action could not be completed.',
		description: 'The error messgage to show, when a device action cannot be performed',
	},
	menuIcon: {
		id: 'accessibilityLabel.menuIcon',
		defaultMessage: 'Menu',
	},
	messageCloseMenu: {
		id: 'accessibilityLabel.messageCloseMenu',
		defaultMessage: 'swipe left, using three fingers to close',
	},
	starIconShowDevices: {
		id: 'accessibilityLabel.starIconShowDevices',
		defaultMessage: 'Show, add to dashboard marker, for all devices',
	},
	starIconHideDevices: {
		id: 'accessibilityLabel.starIconHideDevices',
		defaultMessage: 'Hide, add to dashboard marker, for all devices',
	},
	starIconShowSensors: {
		id: 'accessibilityLabel.starIconShowSensors',
		defaultMessage: 'Show, add to dashboard marker, for all sensors',
	},
	starIconHideSensors: {
		id: 'accessibilityLabel.starIconHideSensors',
		defaultMessage: 'Hide, add to dashboard marker, for all sensors',
	},
});

type Props = {
	dimmer: Object,
	tab: string,
	userProfile: Object,
	dispatch: Function,
	showToast: boolean,
	messageToast: string,
	durationToast: string,
	positionToast: string,
	intl: intlShape.isRequired,
	gatewaysAllIds: Array<any>,
	syncGateways: () => void,
	onTabSelect: (string) => void,
	onNavigationStateChange: (string) => void,
	addNewLocation: () => any,
	screenReaderEnabled: boolean,
};

type State = {
	currentScreen: string,
	settings: boolean,
	starIcon: Object,
	routeName: string,
	addingNewLocation: boolean,
};

class AppNavigatorRenderer extends View {

	props: Props;
	state: State;

	onNavigationStateChange: (Object, Object) => void;
	onDoneDimming: (Object) => void;
	autoDetectLocalTellStick: () => void;
	handleConnectivityChange: () => void;
	onLayout: (Object) => void;
	setNavigatorRef: (any) => void;

	renderNavigationView: () => Object;
	onOpenSetting: () => void;
	onCloseSetting: () => void;
	openDrawer: () => void;
	addNewLocation: () => void;
	onPressGateway: (Object) => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			currentScreen: 'Tabs',
			drawer: false,
			settings: false,
			routeName: 'Dashboard',
			addingNewLocation: false,
		};

		let { formatMessage } = props.intl;

		this.labelButton = formatMessage(i18n.button);
		this.labelButtondefaultDescription = formatMessage(i18n.defaultDescriptionButton);

		this.menuIcon = `${formatMessage(messages.menuIcon)} ${this.labelButton}. ${this.labelButtondefaultDescription}`;
		this.starIconShowDevices = `${formatMessage(messages.starIconShowDevices)}. ${this.labelButtondefaultDescription}`;
		this.starIconHideDevices = `${formatMessage(messages.starIconHideDevices)}. ${this.labelButtondefaultDescription}`;
		this.starIconShowSensors = `${formatMessage(messages.starIconShowSensors)}. ${this.labelButtondefaultDescription}`;
		this.starIconHideSensors = `${formatMessage(messages.starIconHideSensors)}. ${this.labelButtondefaultDescription}`;
		this.messageCloseMenu = `${formatMessage(messages.messageCloseMenu)}`;

		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;
		this.addNewLocationFailed = `${formatMessage(i18n.addNewLocationFailed)}`;

		this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
		this.onDoneDimming = this.onDoneDimming.bind(this);

		this.timeOutConfigureLocalControl = null;
		this.timeOutGetLocalControlToken = null;
		this.autoDetectLocalTellStick = this.autoDetectLocalTellStick.bind(this);
		this.onLayout = this.onLayout.bind(this);
		this.handleConnectivityChange = this.handleConnectivityChange.bind(this);

		this.setNavigatorRef = this.setNavigatorRef.bind(this);

		this.renderNavigationView = this.renderNavigationView.bind(this);
		this.onOpenSetting = this.onOpenSetting.bind(this);
		this.onCloseSetting = this.onCloseSetting.bind(this);
		this.onCloseDrawer = this.onCloseDrawer.bind(this);
		this.onOpenDrawer = this.onOpenDrawer.bind(this);
		this.openDrawer = this.openDrawer.bind(this);
		this.addNewLocation = this.addNewLocation.bind(this);
		this.onPressGateway = this.onPressGateway.bind(this);

		getRSAKey(true);

		const { appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceHeight = isPortrait ? height : width;
		const size = Math.floor(deviceHeight * 0.03);

		let fontSize = size < 20 ? 20 : size;
		this.settingsButton = {
			component: <IconTelldus icon={'settings'} style={{
				fontSize,
				color: '#fff',
			}}/>,
			onPress: this.onOpenSetting,
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
			accessibilityLabel: '',
		};
	}

	componentDidMount() {
		this.props.dispatch(appStart());
		this.props.dispatch(appState());
		// Calling other API requests after resolving the very first one, in order to avoid the situation, where
		// access_token has expired and the API requests, all together goes for fetching new token with refresh_token,
		// and results in generating multiple tokens.
		const { dispatch } = this.props;
		dispatch(getUserProfile()).then(() => {
			dispatch(syncLiveApiOnForeground());
			dispatch(getGateways());
			dispatch(getAppData());
			dispatch(resetSchedule());

			// Auto discover TellStick's that support local control.
			this.autoDetectLocalTellStick();
		});

		NetInfo.addEventListener(
			'connectionChange',
			this.handleConnectivityChange,
		);
	}

	addNewLocation() {
		this.setState({
			addingNewLocation: true,
			addNewGateway: false,
		});
		this.props.addNewLocation()
			.then((response: Object) => {
				if (response.client) {
					navigate('AddLocation', {clients: response.client});
				}
			}).catch((error: Object) => {
				this.setState({
					addingNewLocation: false,
				});
				let message = error.message && error.message === 'Network request failed' ? this.networkFailed : this.addNewLocationFailed;
				this.props.dispatch(showToast(message));
			});
	}

	onCloseSetting() {
		this.setState({ settings: false });
	}

	onOpenDrawer() {
		this.setState({ drawer: true });
		if (this.props.screenReaderEnabled) {
			announceForAccessibility(this.messageCloseMenu);
		}
	}

	onCloseDrawer() {
		this.setState({ drawer: false });
	}

	onPressGateway(location: Object) {
		navigate('LocationDetails', {location});
	}

	onOpenSetting() {
		navigate('Settings');
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		let { showToast: showToastBool, messageToast, durationToast, positionToast, intl,
			gatewaysAllIds, gatewaysToActivate } = this.props;
		if (showToastBool && !prevProps.showToast) {
			let { formatMessage } = intl;
			let message = messageToast ? messageToast : formatMessage(messages.errortoast);
			this._showToast(message, durationToast, positionToast);
		}
		if (gatewaysAllIds.length === 0 && !this.state.addingNewLocation && gatewaysToActivate.checkIfGatewaysEmpty) {
			this.addNewLocation();
		}
	}

	handleConnectivityChange(connectionInfo: Object) {
		const { dispatch } = this.props;
		const { type } = connectionInfo;

		// When ever user's connection change reset the previously auto-discovered ip address, before it is auto-discovered and updated again.
		dispatch(resetLocalControlIP());

		// When user's connection change and if it there is connection to internet, auto-discover TellStick and update it's ip address.
		if (type && type !== 'none') {
			dispatch(autoDetectLocalTellStick());
		}
	}

	// Sends UDP package to the broadcast IP to detect gateways connected in the same LAN.
	autoDetectLocalTellStick() {
		const { dispatch } = this.props;
		this.timeOutConfigureLocalControl = setTimeout(() => {
			dispatch(autoDetectLocalTellStick());
		}, 15000);
	}

	componentWillUnmount() {
		clearTimeout(this.timeOutConfigureLocalControl);
		clearTimeout(this.timeOutGetLocalControlToken);
		NetInfo.removeEventListener(
			'connectionChange',
			this.handleConnectivityChange,
		);
	}

	_showToast(message: string, durationToast: any, positionToast: any) {
		Toast.showWithGravity(message, Toast[durationToast], Toast[positionToast]);
		this.props.dispatch(hideToast());
	}

	onNavigationStateChange(prevState: Object, currentState: Object) {
		const currentScreen = getRouteName(currentState);
		this.setState({ currentScreen });

		this.props.onNavigationStateChange(currentScreen);
	}

	onDoneDimming() {
		this.props.dispatch(hideDimmerStep());
	}

	onLayout(ev: Object) {
		this.props.dispatch(setAppLayout(ev.nativeEvent.layout));
	}

	setNavigatorRef(navigatorRef: any) {
		setTopLevelNavigator(navigatorRef);
	}

	openDrawer() {
		this.refs.drawer.openDrawer();
		this.props.syncGateways();
	}

	renderNavigationView(): Object {
		let { appLayout, userProfile } = this.props;

		return <Drawer
			addNewLocation={this.addNewLocation}
			userProfile={userProfile}
			theme={this.getTheme()}
			onOpenSetting={this.onOpenSetting}
			appLayout={appLayout}
			isOpen={this.state.drawer}
			onPressGateway={this.onPressGateway}
		/>;
	}

	makeLeftButton(styles: Object): any {
		const { drawer } = this.state;
		const { screenReaderEnabled } = this.props;
		this.menuButton.icon.style = styles.menuButtonStyle;
		this.menuButton.icon.iconStyle = styles.menuIconStyle;
		this.menuButton.icon.size = styles.buttonSize > 22 ? styles.buttonSize : 22;
		this.menuButton.accessibilityLabel = this.menuIcon;

		return (drawer && screenReaderEnabled) ? null : this.menuButton;
	}

	render(): Object {
		let { currentScreen: CS, drawer } = this.state;
		let { intl, dimmer, userProfile, appLayout } = this.props;
		let screenProps = {
			currentScreen: CS,
			intl,
			drawer,
			appLayout,
		};
		let { show, name, value, showStep, deviceStep } = dimmer;
		let importantForAccessibility = showStep ? 'no-hide-descendants' : 'no';

		let styles = this.getStyles(appLayout);

		const leftButton = this.makeLeftButton(styles);
		const drawerWidth = getDrawerWidth(styles.deviceWidth);

		const showHeader = CS === 'Tabs' || CS === 'Devices' || CS === 'Sensors' ||
			CS === 'Dashboard' || CS === 'Scheduler' || CS === 'Gateways';

		return (
			<DrawerLayoutAndroid
				ref="drawer"
				drawerWidth={drawerWidth}
				drawerPosition={DrawerLayoutAndroid.positions.Left}
				renderNavigationView={this.renderNavigationView}
				drawerBackgroundColor={'transparent'}
				onDrawerOpen={this.onOpenDrawer}
				onDrawerClose={this.onCloseDrawer}
			>
				{showHeader && (
					<Header style={styles.header} logoStyle={styles.logoStyle} leftButton={leftButton}/>
				)}
				<View style={showHeader ? styles.container : {flex: 1}} importantForAccessibility={importantForAccessibility}>
					<Navigator
						ref={this.setNavigatorRef}
						onNavigationStateChange={this.onNavigationStateChange}
						screenProps={screenProps} />
					<DimmerPopup
						isVisible={show}
						name={name}
						value={value / 255}
					/>
				</View>
				<DimmerStep
					showModal={showStep}
					deviceId={deviceStep}
					onDoneDimming={this.onDoneDimming}
					intl={intl}
				/>
				<UserAgreement showModal={!userProfile.eula} onLayout={this.onLayout}/>
			</DrawerLayoutAndroid>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceHeight = isPortrait ? height : width;
		const deviceWidth = isPortrait ? width : height;

		return {
			deviceWidth,
			header: isPortrait ? {
				height: deviceHeight * 0.05,
				alignItems: 'flex-end',
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
				left: undefined,
				right: 50,
				top: deviceHeight * 0.03666,
				paddingTop: 0,
				paddingHorizontal: 0,
			},
			starButtonStyle: isPortrait ? null : {
				position: 'absolute',
				right: height - 50,
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
		};
	}
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	const { showToast: showToastBool, messageToast, durationToast, positionToast, layout,
		screenReaderEnabled } = state.App;
	const { allIds, toActivate } = state.gateways;

	return {
		showToast: showToastBool,
		messageToast,
		durationToast,
		positionToast,
		userProfile: getUserProfileSelector(state),
		dimmer: state.dimmer,
		tab: state.navigation.tab,
		appLayout: getRelativeDimensions(layout),

		gatewaysAllIds: allIds,
		gatewaysToActivate: toActivate,
		screenReaderEnabled,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
		syncGateways: () => {
			dispatch(syncWithServer('gatewaysTab'));
		},
		onNavigationStateChange: (tab: string) => {
			dispatch(syncWithServer(tab));
			dispatch(switchTab(tab));
		},
		addNewLocation: (): Function => {
			return dispatch(addNewGateway());
		},
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(AppNavigatorRenderer));
