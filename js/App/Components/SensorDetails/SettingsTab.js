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
import {
	ScrollView,
	LayoutAnimation,
	BackHandler,
} from 'react-native';
import { connect } from 'react-redux';
const isEqual = require('react-fast-compare');

import {
	View,
	TabBar,
	Text,
	SettingsRow,
	TouchableButton,
	EditBox,
	DialogueBox,
	DialogueHeader,
} from '../../../BaseComponents';

import {
	addToDashboard,
	removeFromDashboard,
	showToast,
	setKeepHistory,
	setIgnoreSensor,
	getSensorInfo,
	setSensorName,
	removeSensorHistory,
	resetSensorMaxMin,
} from '../../Actions';
import { clearHistory } from '../../Actions/LocalStorage';
import { shouldUpdate, LayoutAnimations } from '../../Lib';

import Theme from '../../Theme';

import i18n from '../../Translations/common';

type Props = {
	dispatch: Function,
	sensor: Object,
	inDashboard: boolean,

	screenProps: Object,
	onAddToDashboard: (id: number) => void,
	onRemoveFromDashboard: (id: number) => void,
};

type State = {
	isHidden: boolean,
	keepHistory: boolean,
	editName: boolean,
	sensorName: string,
	dialogueConfig: {
		show: boolean,
		action: string | null,
	},
	switchConf: {
		transition: boolean,
		source: string,
	},
};


class SettingsTab extends View {
	props: Props;
	state: State;

	onValueChange: number => void;
	setIgnoreSensor: (boolean) => void;
	setKeepHistory: (boolean) => void;

	editName: () => void;
	onChangeName: (string) => void;
	clearHistory: () => void;
	resetMaxMin: () => void;
	onConfirmResetMaxMin: () => void;
	onConfirmClearHistory: () => void;
	closeModal: () => void;
	submitName: () => void;
	clearHistoryCache: () => void;
	onConfirmClearHistoryCache: () => void;

	handleBackPress: () => void;

	static navigationOptions = ({ navigation }: Object): Object => ({
		tabBarLabel: ({ tintColor }: Object): Object => (
			<TabBar
				icon="settings"
				tintColor={tintColor}
				label={i18n.settingsHeader}
				accessibilityLabel={i18n.deviceSettingsTab}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			navigation.navigate({
				routeName: 'SSettings',
				key: 'SSettings',
			});
		},
	});

	static getDerivedStateFromProps(props: Object, state: Object): null | Object {
		const { screenProps, sensor } = props;
		const { switchConf } = state;
		const { transition, source } = switchConf;

		// This is required to make the 'keepHistory' prop update when changed from history tab
		// also while toggling switch prevent update in between API response.
		if (screenProps.currentScreen === 'SSettings' &&
			state.keepHistory !== sensor.keepHistory &&
			source !== 'keepHistory' && !transition
		) {
			return {
				keepHistory: sensor.keepHistory,
			};
		}
		return null;
	}

	constructor(props: Props) {
		super(props);
		this.onValueChange = this.onValueChange.bind(this);
		this.setIgnoreSensor = this.setIgnoreSensor.bind(this);
		this.setKeepHistory = this.setKeepHistory.bind(this);

		this.state = {
			isHidden: props.sensor.ignored,
			keepHistory: props.sensor.keepHistory,
			editName: false,
			sensorName: props.sensor.name,
			dialogueConfig: {
				show: false,
				action: null,
			},
			switchConf: {
				transition: false,
				source: '',
			},
		};

		const { formatMessage } = props.screenProps.intl;

		this.addedToHiddenList = formatMessage(i18n.sensorAddedToHiddenList);
		this.removedFromHiddenList = formatMessage(i18n.sensorRemovedFromHiddenList);

		this.toastStoreHistory = formatMessage(i18n.toastStoreHistory);
		this.toastStoreNotHistory = formatMessage(i18n.toastStoreNotHistory);

		this.editName = this.editName.bind(this);
		this.onChangeName = this.onChangeName.bind(this);
		this.clearHistory = this.clearHistory.bind(this);
		this.resetMaxMin = this.resetMaxMin.bind(this);
		this.onConfirmClearHistory = this.onConfirmClearHistory.bind(this);
		this.onConfirmResetMaxMin = this.onConfirmResetMaxMin.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.submitName = this.submitName.bind(this);
		this.clearHistoryCache = this.clearHistoryCache.bind(this);
		this.onConfirmClearHistoryCache = this.onConfirmClearHistoryCache.bind(this);

		this.handleBackPress = this.handleBackPress.bind(this);
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const { screenProps: screenPropsN, inDashboard: inDashboardN, ...othersN } = nextProps;
		const { currentScreen, appLayout } = screenPropsN;
		if (currentScreen === 'SSettings') {
			if (this.props.screenProps.currentScreen !== 'SSettings') {
				return true;
			}

			const isStateEqual = isEqual(this.state, nextState);
			if (!isStateEqual) {
				return true;
			}

			const { screenProps, inDashboard, ...others } = this.props;
			if ((screenProps.appLayout.width !== appLayout.width) || (inDashboardN !== inDashboard)) {
				return true;
			}

			const propsChange = shouldUpdate(others, othersN, ['sensor']);
			if (propsChange) {
				return true;
			}

			return false;
		}
		return false;
	}

	handleBackPress(): boolean {
		const { editName } = this.state;
		if (editName) {
			LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
			this.setState({
				editName: false,
				sensorName: this.props.sensor.name,
			});
			return true;
		}
		return false;
	}

	editName() {
		LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
		this.setState({
			editName: true,
		});
	}

	onChangeName(sensorName: string) {
		this.setState({
			sensorName,
		});
	}

	submitName() {
		const { dispatch, sensor } = this.props;
		const { sensorName } = this.state;
		dispatch(setSensorName(sensor.id, sensorName)).then(() => {
			LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
			dispatch(getSensorInfo(sensor.id));
			this.setState({
				editName: false,
			});
		}).catch((err: Object) => {
			LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
			this.setState({
				editName: false,
				sensorName: sensor.name,
			});
			const	message = err.message ? err.message : null;
			dispatch(showToast(message));
		});
	}

	clearHistoryCache() {
		this.setState({
			dialogueConfig: {
				show: true,
				action: 'clearHistoryCache',
			},
		});
	}

	onConfirmClearHistoryCache() {
		const { dispatch, sensor, screenProps } = this.props;
		const { formatMessage } = screenProps.intl;

		clearHistory('sensor', sensor.id).then(() => {
			dispatch(showToast(formatMessage(i18n.clearCacheSuccess)));
			this.closeModal();
		}).catch(() => {
			dispatch(showToast(null));
			this.closeModal();
		});
	}

	clearHistory() {
		this.setState({
			dialogueConfig: {
				show: true,
				action: 'clearHistory',
			},
		});
	}

	onConfirmClearHistory() {
		const { dispatch, sensor, screenProps } = this.props;
		const { formatMessage } = screenProps.intl;

		dispatch(removeSensorHistory(sensor.id)).then(() => {
			dispatch(showToast(formatMessage(i18n.clearSuccess)));
			this.closeModal();
			clearHistory('sensor', sensor.id);
		}).catch((err: Object) => {
			this.closeModal();
			const	message = err.message ? err.message : null;
			dispatch(showToast(message));
		});
	}

	resetMaxMin() {
		this.setState({
			dialogueConfig: {
				show: true,
				action: 'resetMaxMin',
			},
		});
	}

	closeModal() {
		const { dialogueConfig } = this.state;
		this.setState({
			dialogueConfig: {
				show: false,
				action: dialogueConfig.action,
			},
		});
	}

	onConfirmResetMaxMin() {
		const { dispatch, sensor, screenProps } = this.props;
		const { formatMessage } = screenProps.intl;

		dispatch(resetSensorMaxMin(sensor.id)).then(() => {
			dispatch(getSensorInfo(sensor.id));
			this.closeModal();
			dispatch(showToast(formatMessage(i18n.resetSuccess)));
		}).catch((err: Object) => {
			this.closeModal();
			const	message = err.message ? err.message : null;
			dispatch(showToast(message));
		});
	}

	onValueChange(value: boolean) {
		if (!value) {
			this.props.onRemoveFromDashboard(this.props.sensor.id);
		} else {
			this.props.onAddToDashboard(this.props.sensor.id);
		}
	}

	setIgnoreSensor(value: boolean) {
		const { sensor } = this.props;
		const ignore = sensor.ignored ? 0 : 1;
		this.setState({
			isHidden: value,
		});
		this.props.dispatch(setIgnoreSensor(sensor.id, ignore)).then((res: Object) => {
			const message = !value ?
				this.removedFromHiddenList : this.addedToHiddenList;
			this.props.dispatch(getSensorInfo(sensor.id));
			this.props.dispatch(showToast(message));
		}).catch((err: Object) => {
			const	message = err.message ? err.message : null;
			this.setState({
				isHidden: sensor.ignored,
			});
			this.props.dispatch(showToast(message));
		});
	}

	setKeepHistory(value: boolean) {
		const { sensor } = this.props;
		const keepHistory = sensor.keepHistory ? 0 : 1;
		this.setState({
			keepHistory: value,
			switchConf: {
				transition: true,
				source: 'keepHistory',
			},
		});
		this.props.dispatch(setKeepHistory(sensor.id, keepHistory)).then((res: Object) => {
			const message = !value ?
				this.toastStoreNotHistory : this.toastStoreHistory;
			this.props.dispatch(getSensorInfo(sensor.id));
			this.props.dispatch(showToast(message));
			this.setState({
				switchConf: {
					transition: false,
					source: '',
				},
			});
		}).catch((err: Object) => {
			const	message = err.message ? err.message : null;
			this.setState({
				keepHistory: sensor.keepHistory,
				switchConf: {
					transition: false,
					source: '',
				},
			});
			this.props.dispatch(showToast(message));
		});
	}

	formatProtocol(protocol: string): string {
		switch (protocol) {
			case 'zwave':
				return 'Z-Wave';
			default:
				return protocol;
		}
	}

	dialogueHeader({ dialogueHeader, dialogueHeaderStyle, dialogueHeaderTextStyle }: Object): Object {
		return (
			<DialogueHeader
				headerText={dialogueHeader}
				showIcon={false}
				headerStyle={dialogueHeaderStyle}
				dialogueHeaderTextStyle={dialogueHeaderTextStyle}/>
		);
	}

	prepareDialogueConfig({ show, action }: Object): Object {
		const { formatMessage } = this.props.screenProps.intl;
		if (action === 'clearHistory') {
			return {
				showDialogue: show,
				dialogueHeader: `${formatMessage(i18n.clearHistory).toUpperCase()}?`,
				message: formatMessage(i18n.messageClearHistory),
				positiveText: formatMessage(i18n.labelClearHistory).toUpperCase(),
				onPressPositive: this.onConfirmClearHistory,
			};
		}
		if (action === 'clearHistoryCache') {
			return {
				showDialogue: show,
				dialogueHeader: `${formatMessage(i18n.clearHistoryCache).toUpperCase()}?`,
				message: formatMessage(i18n.messageClearCache),
				positiveText: formatMessage(i18n.labelClearCache).toUpperCase(),
				onPressPositive: this.onConfirmClearHistoryCache,
			};
		}
		return {
			showDialogue: show,
			dialogueHeader: `${formatMessage(i18n.resetMaxMin).toUpperCase()}?`,
			message: formatMessage(i18n.messageResetMaxMin),
			positiveText: formatMessage(i18n.labelResetMaxMin).toUpperCase(),
			onPressPositive: this.onConfirmResetMaxMin,
		};
	}

	render(): Object | null {
		const { keepHistory, isHidden, editName, sensorName, dialogueConfig } = this.state;
		const { inDashboard, sensor } = this.props;

		if (!sensor.sensorId) {
			return null;
		}

		const { model, protocol, sensorId, name } = sensor;
		const { appLayout, intl } = this.props.screenProps;
		const { formatMessage } = intl;

		const {
			container,
			infoHeaderText,
			buttonStyle,
			editBoxStyle,
			dialogueHeaderStyle,
			dialogueHeaderTextStyle,
			clearCacheHintStyle,
		} = this.getStyle(appLayout);

		if (editName) {
			return (
				<View style={container}>
					<EditBox
						value={sensorName}
						icon={'sensor'}
						label={formatMessage(i18n.name)}
						onChangeText={this.onChangeName}
						onSubmitEditing={this.submitName}
						appLayout={appLayout}
						containerStyle={editBoxStyle}
					/>
				</View>
			);
		}

		const {
			showDialogue,
			dialogueHeader,
			message,
			positiveText,
			onPressPositive,
		} = this.prepareDialogueConfig(dialogueConfig);
		const dialogueHeaderProps = {
			dialogueHeader,
			dialogueHeaderStyle,
			dialogueHeaderTextStyle,
		};

		return (
			<ScrollView
				style={{
					flex: 1,
					backgroundColor: Theme.Core.appBackground,
				}}
				contentContainerStyle={{flexGrow: 1}}>
				<View style={container}>
					<SettingsRow
						type={'text'}
						edit={true}
						onPress={this.editName}
						label={formatMessage(i18n.name)}
						value={name}
						appLayout={appLayout}
						intl={intl}
					/>
					<SettingsRow
						label={formatMessage(i18n.showOnDashborad)}
						onValueChange={this.onValueChange}
						value={inDashboard}
						appLayout={appLayout}
						intl={intl}
					/>
					<SettingsRow
						label={formatMessage(i18n.hideFromListS)}
						onValueChange={this.setIgnoreSensor}
						value={isHidden}
						appLayout={appLayout}
						intl={intl}
					/>
					<SettingsRow
						label={formatMessage(i18n.labelStoreHistory)}
						onValueChange={this.setKeepHistory}
						value={keepHistory}
						appLayout={appLayout}
						intl={intl}
					/>
					<TouchableButton
						text={formatMessage(i18n.clearHistory).toUpperCase()}
						onPress={this.clearHistory}
						style={buttonStyle}
						accessible={true}/>
					<TouchableButton
						text={formatMessage(i18n.resetMaxMin).toUpperCase()}
						onPress={this.resetMaxMin}
						style={buttonStyle}
						accessible={true}/>
					<TouchableButton
						text={formatMessage(i18n.clearHistoryCache).toUpperCase()}
						onPress={this.clearHistoryCache}
						style={buttonStyle}
						accessible={true}/>
					<Text style={clearCacheHintStyle}>
						{formatMessage(i18n.hintHistoryCache)}.
					</Text>
					<Text style={infoHeaderText}>
						{formatMessage(i18n.labelTechnicalInfo)}
					</Text>
					<SettingsRow
						type={'text'}
						label={formatMessage(i18n.labelProtocol)}
						value={this.formatProtocol(protocol)}
						appLayout={appLayout}
						intl={intl}
					/>
					<SettingsRow
						type={'text'}
						label={formatMessage(i18n.labelModel)}
						value={model}
						appLayout={appLayout}
						intl={intl}
					/>
					<SettingsRow
						type={'text'}
						label={`${formatMessage(i18n.labelSensor)} ${formatMessage(i18n.labelId)}`}
						value={sensorId}
						appLayout={appLayout}
						intl={intl}
					/>
				</View>
				<DialogueBox
					dialogueContainerStyle={{elevation: 0}}
					header={this.dialogueHeader(dialogueHeaderProps)}
					showDialogue={showDialogue}
					text={message}
					showPositive={true}
					showNegative={true}
					positiveText={positiveText}
					onPressPositive={onPressPositive}
					onPressNegative={this.closeModal}/>
			</ScrollView>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { inactiveTintColor, paddingFactor, eulaContentColor } = Theme.Core;

		const padding = deviceWidth * paddingFactor;
		const fontSize = deviceWidth * 0.04;

		return {
			container: {
				flex: 1,
				paddingHorizontal: padding,
				paddingBottom: padding,
				paddingTop: padding / 2,
			},
			infoHeaderText: {
				fontSize,
				color: inactiveTintColor,
				marginTop: padding * 2,
			},
			editBoxStyle: {
				marginTop: padding * 2,
			},
			buttonStyle: {
				marginTop: padding * 2,
				paddingHorizontal: 15,
			},
			dialogueHeaderStyle: {
				paddingVertical: Math.floor(deviceWidth * 0.042),
				paddingHorizontal: 5 + Math.floor(deviceWidth * 0.042),
				width: deviceWidth * 0.75,
			},
			dialogueHeaderTextStyle: {
				fontSize: 13,
			},
			clearCacheHintStyle: {
				fontSize,
				textAlign: 'center',
				color: eulaContentColor,
				marginTop: padding * 2,
				marginHorizontal: padding * 2,
			},
		};
	}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		onAddToDashboard: (id: number): any => dispatch(addToDashboard('sensor', id)),
		onRemoveFromDashboard: (id: number): any => dispatch(removeFromDashboard('sensor', id)),
		dispatch,
	};
}
function mapStateToProps(state: Object, ownProps: Object): Object {
	const id = ownProps.navigation.getParam('id', null);
	const sensor = state.sensors.byId[id];
	return {
		sensor: sensor ? sensor : {},
		inDashboard: !!state.dashboard.sensorsById[id],
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SettingsTab);
