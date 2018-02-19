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

import { Icon, View, RoundedCornerShadowView } from 'BaseComponents';
import { StyleSheet, TouchableOpacity } from 'react-native';

import ButtonLoadingIndicator from './ButtonLoadingIndicator';
import i18n from '../../../Translations/common';
import { deviceSetState, requestDeviceAction } from 'Actions_Devices';

import Theme from 'Theme';

const UpButton = ({ supportedMethod, onPress, methodRequested, accessibilityLabel, isActive }) => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}
		accessibilityLabel={accessibilityLabel}>
		<Icon name="caret-up" size={30}
		      style={
				  supportedMethod ? (isActive ? styles.active : styles.enabled) : styles.disabled
		      }
		/>
		{
			methodRequested === 'UP' ?
				<ButtonLoadingIndicator style={styles.dot} />
				:
				null
		}
	</TouchableOpacity>
);

const DownButton = ({ supportedMethod, onPress, methodRequested, accessibilityLabel, isActive }) => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}
		accessibilityLabel={accessibilityLabel}>
		<Icon name="caret-down" size={30}
			style={
				supportedMethod ? (isActive ? styles.active : styles.enabled) : styles.disabled
		      }
		/>
		{
			methodRequested === 'DOWN' ?
				<ButtonLoadingIndicator style={styles.dot} />
				:
				null
		}
	</TouchableOpacity>
);

const StopButton = ({ supportedMethod, onPress, methodRequested, accessibilityLabel, isActive }) => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}
		accessibilityLabel={accessibilityLabel}>
		<Icon name="stop" size={20}
			style={
				supportedMethod ? (isActive ? styles.active : styles.enabled) : styles.disabled
		      }
		/>
		{
			methodRequested === 'STOP' ?
				<ButtonLoadingIndicator style={styles.dot} />
				:
				null
		}
	</TouchableOpacity>
);

type Props = {
	device: Object,
	style: Object,
	commandUp: number,
	commandDown: number,
	commandStop: number,
	deviceSetState: (id: number, command: number, value?: number) => void,
	requestDeviceAction: (id: number, command: number) => void,
	intl: Object,
};

class NavigationalButton extends View {
	props: Props;

	onUp: (number) => void;
	onDown: (number) => void;
	onStop: (number) => void;

	constructor(props: Props) {
		super(props);

		this.onUp = this.onUp.bind(this);
		this.onDown = this.onDown.bind(this);
		this.onStop = this.onStop.bind(this);

		this.labelUpButton = `${props.intl.formatMessage(i18n.up)} ${props.intl.formatMessage(i18n.button)}`;
		this.labelDownButton = `${props.intl.formatMessage(i18n.down)} ${props.intl.formatMessage(i18n.button)}`;
		this.labelStopButton = `${props.intl.formatMessage(i18n.stop)} ${props.intl.formatMessage(i18n.button)}`;
	}

	onUp() {
		this.props.requestDeviceAction(this.props.device.id, this.props.commandUp);
		this.props.deviceSetState(this.props.device.id, this.props.commandUp);
	}
	onDown() {
		this.props.requestDeviceAction(this.props.device.id, this.props.commandDown);
		this.props.deviceSetState(this.props.device.id, this.props.commandDown);
	}
	onStop() {
		this.props.requestDeviceAction(this.props.device.id, this.props.commandStop);
		this.props.deviceSetState(this.props.device.id, this.props.commandStop);
	}

	render() {
		const noop = function () {
		};
		const { name, supportedMethods, methodRequested, isInState } = this.props.device;
		const { UP, DOWN, STOP } = supportedMethods;

		return (
			<RoundedCornerShadowView style={this.props.style}>
				<UpButton supportedMethod={UP} methodRequested={methodRequested} onPress={UP ? this.onUp : noop}
					accessibilityLabel={`${this.labelUpButton}, ${name}`} isActive={isInState === 'UP'}/>
				<DownButton supportedMethod={DOWN} methodRequested={methodRequested} onPress={DOWN ? this.onDown : noop}
					accessibilityLabel={`${this.labelDownButton}, ${name}`} isActive={isInState === 'DOWN'}/>
				<StopButton supportedMethod={STOP} methodRequested={methodRequested} onPress={STOP ? this.onStop : noop}
					accessibilityLabel={`${this.labelStopButton}, ${name}`} isActive={isInState === 'STOP'}/>
			</RoundedCornerShadowView>
		);
	}
}

NavigationalButton.defaultProps = {
	commandUp: 128,
	commandDown: 256,
	commandStop: 512,
};

const styles = StyleSheet.create({
	navigationButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	active: {
		color: Theme.Core.brandSecondary,
	},
	enabled: {
		color: '#1a355b',
	},
	disabled: {
		color: '#eeeeee',
	},
	dot: {
		position: 'absolute',
		top: 3,
		left: 3,
	},
});

function mapDispatchToProps(dispatch) {
	return {
		deviceSetState: (id: number, command: number, value?: number) => dispatch(deviceSetState(id, command, value)),
		requestDeviceAction: (id: number, command: number) => dispatch(requestDeviceAction(id, command)),
	};
}

module.exports = connect(null, mapDispatchToProps)(NavigationalButton);
