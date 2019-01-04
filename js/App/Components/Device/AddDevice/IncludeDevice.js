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
 */

// @flow

'use strict';

import React from 'react';
const isEqual = require('react-fast-compare');

import {
	View,
	Text,
	Image,
	BlockIcon,
	ProgressBarLinear,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';
import shouldUpdate from '../../../Lib/shouldUpdate';
import {
	checkInclusionComplete,
	handleCommandClasses,
} from '../../../Lib/DeviceUtils';

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	addDevice: Object,

	onDidMount: (string, string, ?Object) => void,
	navigation: Object,
	actions: Object,
	intl: Object,
};

type State = {
	showTimer: boolean,
	timer: number | null,
	status: string | null,
	percent: number,
	width: number,
};

class IncludeDevice extends View<Props, State> {
props: Props;
state: State;

setSocketListeners: () => void;

zwaveId: ?number;
deviceId: ?number;
clientDeviceId: ?number;
onLayout: (Object) => void;
deviceManufactInfo: Object;
deviceProdInfo: Object;
isDeviceAwake: boolean;
isDeviceBatteried: boolean;
gatewayId: number;
constructor(props: Props) {
	super(props);

	this.state = {
		showTimer: true,
		timer: null,
		status: null,
		percent: 0,
		width: 0,
	};

	this.setSocketListeners = this.setSocketListeners.bind(this);

	const { actions, navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});
	this.websocket = actions.getSocketObject(gateway.id);
	this.gatewayId = gateway.id;
	if (this.websocket) {
		this.setSocketListeners();
	}

	this.inclusionTimer = null;
	this.sleepCheckTimeInterval = null;
	this.sleepCheckTimeout = null;
	this.zwaveId = null;
	this.deviceId = null;
	this.commandClasses = null;
	this.clientDeviceId = null;
	this.deviceManufactInfo = {};
	this.deviceProdInfo = {};
	this.isDeviceAwake = true;
	this.isDeviceBatteried = false;
	this.showToast = true;

	this.onLayout = this.onLayout.bind(this);
}

componentDidMount() {
	const { onDidMount, actions, navigation, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(`3. ${formatMessage(i18n.labelInclude)}`, formatMessage(i18n.AddZDIncludeHeaderTwo));

	const gateway = navigation.getParam('gateway', {});
	const module = navigation.getParam('module', '');
	const action = navigation.getParam('action', '');
	this.deviceId = null;
	actions.sendSocketMessage(gateway.id, 'client', 'forward', {
		module,
		action,
	});
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	if (nextProps.currentScreen === 'IncludeDevice') {
		if (shouldUpdate(nextProps, this.props, ['addDevice', 'appLayout'])) {
			return true;
		}
		if (!isEqual(this.state, nextState)) {
			return true;
		}
		return false;
	}
	return false;
}

setSocketListeners() {
	const that = this;
	const { intl, actions } = this.props;
	const { formatMessage } = intl;
	this.websocket.onmessage = (msg: Object) => {
		let message = {};
		try {
			message = JSON.parse(msg.data);
		} catch (e) {
			message = msg.data;
		}

		const { module, action, data } = message;
		if (module && action) {
			if (module === 'zwave' && action === 'addNodeToNetworkStartTimeout') {
				this.showToast = true;
				that.inclusionTimer = setInterval(() => {
					that.runInclusionTimer(data);
				}, 1000);
			} else if (module === 'zwave' && action === 'addNodeToNetwork') {
				let status = data[0];
				if (status === 1) {
					this.setState({
						status: `${formatMessage(i18n.addNodeToNetworkOne)}...`,
					});
				} else if (status === 2) {
					this.isDeviceAwake = true;
					this.startSleepCheckTimer();
					this.setState({
						status: formatMessage(i18n.addNodeToNetworkTwo),
						showTimer: false,
					});
				} else if (status === 3 || status === 4) {
					this.isDeviceAwake = true;
					this.startSleepCheckTimer();

					this.checkDeviceAlreadyIncluded(data[1]);

					this.zwaveId = data[1];
					this.commandClasses = {};
					this.commandClasses = handleCommandClasses(action, this.commandClasses, data);

					if (status === 3) {
						this.setState({
							status: formatMessage(i18n.addNodeToNetworkThree),
							showTimer: false,
						});
					} else {
						this.setState({
							status: formatMessage(i18n.addNodeToNetworkFour),
							showTimer: false,
						});
					}
				} else if (status === 5) {
					// Add node protocol done
					this.isDeviceAwake = true;

					this.checkDeviceAlreadyIncluded(data[1]);

					if (!this.zwaveId) {
						this.zwaveId = data[1];
					}
				} else if (status === 6) {
					this.isDeviceAwake = true;
					// Add node done
					// this.clearTimer();
				} else if (status === 7) {
					this.setState({
						status: 'Error : could not enter learn mode',
					});
				} else if (status === 0x23) {
					this.setState({
						status: 'Error : could not enter learn mode',
					});
				}
			} else if (module === 'zwave' && action === 'interviewDone' && (this.zwaveId === parseInt(data.node, 10))) {
				this.isDeviceAwake = true;

				this.commandClasses = handleCommandClasses(action, this.commandClasses, data);

				if (data.cmdClass === 114) {
					this.deviceProdInfo = data.data;
				}
				const { percent, waiting, status } = checkInclusionComplete(this.commandClasses, formatMessage);
				if (percent) {
					this.setState({
						status,
						percent,
					});
					if (waiting === 0) {
						this.setState({
							timer: null,
							status,
						}, () => {
							this.onInclusionComplete();
						});
						this.clearTimer();
					}
				}
			} else if (module === 'zwave' && action === 'nodeList') {
				actions.processWebsocketMessageForZWave(action, data, this.gatewayId.toString());
			} else if (module === 'zwave' && action === 'sleeping') {
				actions.showToast('Please try to wake the device manually');
			} else if (module === 'device') {
				if (action === 'added' && !this.deviceId) {
					this.isDeviceAwake = true;
					this.startSleepCheckTimer();
					const { clientDeviceId, id } = data;
					this.deviceId = id;
					this.clientDeviceId = clientDeviceId;
				}

				actions.processWebsocketMessageForDevice(action, data);
			}
		}
	};
}

checkDeviceAlreadyIncluded(nodeId: number) {
	const { addDevice, actions } = this.props;
	const alreadyIncluded = addDevice.nodeList[nodeId];
	if (alreadyIncluded) {
		const { name } = alreadyIncluded;
		actions.showToast(`Device seem to have already included by the name "${name}". Please exclude and try again.`);
	}
}

runInclusionTimer(data?: number = 60) {
	const { timer } = this.state;
	if (timer === null || timer > 0) {
		this.setState({
			timer: timer ? timer - 1 : data,
		});
	} else {
		this.setState({
			timer: null,
		});
		this.props.actions.showToast('Inclusion timed out!');
		this.clearTimer();
	}
}

onInclusionComplete() {
	this.getDeviceManufactInfo();
	clearTimeout(this.sleepCheckTimeout);
}

getDeviceManufactInfo() {
	const { actions } = this.props;
	const { manufacturerId, productTypeId, productId } = this.deviceProdInfo;

	let deviceManufactInfo = {};
	if (manufacturerId) {
		actions.getDeviceManufacturerInfo(manufacturerId, productTypeId, productId)
			.then((res: Object) => {
				const { Image: deviceImage = null, Name: deviceName = null, Brand: deviceBrand = null } = res;
				Image.prefetch(deviceImage);
				Image.getSize(deviceImage, (width: number, height: number) => {
					if (width && height) {
						deviceManufactInfo = {
							deviceImage,
							deviceName,
							deviceBrand,
							imageW: width,
							imageH: height,
						};
						this.navigateToNext(deviceManufactInfo);
					}
				}, (failure: any) => {
					deviceManufactInfo = {
						deviceImage,
						deviceName,
						deviceBrand,
					};
					this.navigateToNext(deviceManufactInfo);
				});
			}).catch(() => {
				deviceManufactInfo = {
					deviceImage: null,
					deviceName: null,
					deviceBrand: null,
				};
				this.navigateToNext(deviceManufactInfo);
			});
	} else {
		this.navigateToNext(deviceManufactInfo);
	}
}

navigateToNext(deviceManufactInfo: Object) {
	const { navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});
	navigation.navigate({
		routeName: 'DeviceName',
		key: 'DeviceName',
		params: {
			gateway,
			deviceId: this.deviceId,
			info: {...deviceManufactInfo},
		},
	});
}

componentWillUnmount() {
	this.clearSocketListeners();
	this.clearTimer();
	clearTimeout(this.sleepCheckTimeout);
	this.deviceId = null;
}

startSleepCheckTimer(timeout: number = 60000) {
	if (!this.sleepCheckTimeout) {
		this.sleepCheckTimeout = setTimeout(() => {
			// Every 10secs check if device is awake.
			this.sleepCheckTimeInterval = setInterval(() => {
				// Change awake state and wait till the next cycle.
				if (this.isDeviceAwake) {
					this.isDeviceAwake = false;
				}
				// Device has gone to sleep, wake him up!
				if (!this.isDeviceAwake && this.showToast && this.state.timer) {
					// TODO: Need to handle devices with and without battery separate, also translate
					const { actions } = this.props;
					actions.showToast('Please try to wake the device manually');
					this.showToast = false;
				}
			}, 10000);
		}, timeout);
	}
}

clearSocketListeners() {
	this.websocket = null;
}

clearTimer() {
	clearInterval(this.inclusionTimer);
}

onLayout(ev: Object) {
	let { width } = ev.nativeEvent.layout;
	if (this.state.width !== width) {
		this.setState({
			width,
		});
	}
}

render(): Object {
	const { intl } = this.props;
	const { timer, status, percent, width, showTimer } = this.state;
	const {
		container,
		progressContainer,
		infoContainer,
		imageType,
		textStyle,
		infoIconStyle,
		blockIcontainerStyle,
		markerTextCover,
		markerText,
		timerStyle,
		statusStyle,
		blockLeft,
		infoOneContainer,
	} = this.getStyles();

	const progress = Math.max(percent / 100, 0);
	const { formatMessage } = intl;

	return (
		<View style={container}>
			<View style={progressContainer}>
				<View style={[blockLeft, {
					flexDirection: 'column',
					alignItems: 'flex-start',
				}]}>
					<View style={markerTextCover}>
						<Text style={markerText}>
                            1.
						</Text>
					</View>
					<Image source={{uri: 'img_zwave_include'}} resizeMode={'cover'} style={imageType}/>
				</View>
				<View style={infoOneContainer} onLayout={this.onLayout}>
					<Text style={textStyle}>
						{formatMessage(i18n.messageOne)}
					</Text>
					<Text/>
					<Text style={textStyle}>
						{formatMessage(i18n.messageTwo)}
					</Text>
					<Text/>
					<Text style={timerStyle}>
						{(timer !== null && showTimer) ? `${timer} ${formatMessage(i18n.labelSeconds).toLowerCase()}` : ' '}
					</Text>
					<Text style={statusStyle}>
						{status !== null ? `${status} (${percent}% ${formatMessage(i18n.done).toLowerCase()})` : ' '}
					</Text>
					<ProgressBarLinear
						progress={progress}
						height={4}
						width={width}
						borderWidth={0}
						borderColor="transparent"
						unfilledColor={Theme.Core.inactiveSwitchBackground} />
				</View>
			</View>
			<View style={infoContainer}>
				<View style={blockLeft}>
					<BlockIcon icon={'info'} style={infoIconStyle} containerStyle={blockIcontainerStyle}/>
				</View>
				<View style={{
					flex: 1,
					flexDirection: 'column',
					flexWrap: 'wrap',
				}}>
					<Text style={textStyle}>
						{formatMessage(i18n.messageHint)}
					</Text>
				</View>
			</View>
		</View>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { paddingFactor, shadow, rowTextColor, brandSecondary, brandPrimary } = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = deviceWidth * 0.035;
	const fontSizeStatus = deviceWidth * 0.03;
	const blockIconContainerSize = deviceWidth * 0.26;

	const contPadding = 5 + (fontSizeText * 0.5);
	const markerHeight = deviceWidth * 0.075;

	const contOneTop = markerHeight - contPadding;

	return {
		innerPadding: contPadding,
		container: {
			flex: 1,
			paddingTop: padding,
			paddingBottom: padding / 2,
			marginHorizontal: padding,
		},
		progressContainer: {
			flexDirection: 'row',
			marginBottom: padding / 2,
			backgroundColor: '#fff',
			borderRadius: 2,
			padding: contPadding,
			...shadow,
		},
		infoContainer: {
			flexDirection: 'row',
			marginBottom: padding / 2,
			backgroundColor: '#fff',
			borderRadius: 2,
			padding: contPadding,
			...shadow,
		},
		markerTextCover: {
			position: 'absolute',
			left: -(contPadding),
			top: -(contPadding),
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: brandPrimary,
			borderBottomRightRadius: markerHeight + 20,
			height: markerHeight,
			width: deviceWidth * 0.19,
		},
		markerText: {
			fontSize: deviceWidth * 0.045,
			color: '#fff',
		},
		infoOneContainer: {
			flex: 1,
			flexDirection: 'column',
			flexWrap: 'wrap',
			paddingTop: contOneTop,
		},
		imageType: {
			marginTop: markerHeight,
			height: deviceWidth * 0.20,
			width: deviceWidth * 0.17,
		},
		textStyle: {
			fontSize: fontSizeText,
			color: rowTextColor,
		},
		infoIconStyle: {
			fontSize: blockIconContainerSize / 2,
			color: brandSecondary,
		},
		blockIcontainerStyle: {
			width: blockIconContainerSize,
			height: undefined,
			borderRadius: 0,
			backgroundColor: '#fff',
		},
		timerStyle: {
			fontSize: deviceWidth * 0.045,
			color: brandSecondary,
			marginTop: 4,
		},
		statusStyle: {
			fontSize: fontSizeStatus,
			color: rowTextColor,
			marginBottom: 4,
		},
		blockLeft: {
			width: deviceWidth * 0.21,
			justifyContent: 'center',
			alignItems: 'center',
		},
	};
}
}

export default IncludeDevice;
