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

import { down, up, stop } from 'Actions_Devices';

const UpButton = ({ supportedMethod, onPress }) => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}>
		<Icon name="caret-up" size={30}
		      style={{
			      color: supportedMethod ? '#1a355b' : '#eeeeee',
		      }}
		/>
	</TouchableOpacity>
);

const DownButton = ({ supportedMethod, onPress }) => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}>
		<Icon name="caret-down" size={30}
			style={supportedMethod ? styles.enabled : styles.disabled}
		/>
	</TouchableOpacity>
);

const StopButton = ({ supportedMethod, onPress }) => (
	<TouchableOpacity
		style={styles.navigationButton}
		onPress={onPress}>
		<Icon name="stop" size={20}
			style={supportedMethod ? styles.enabled : styles.disabled}
		/>
	</TouchableOpacity>
);

type Props = {
	device: Object,
	onUp: number => void,
	onDown: number => void,
	onStop: number => void,
	style: Object,
};

class NavigationalButton extends View {
	props: Props;

	constructor(props) {
		super(props);

		this.state = {
			state: this.props.value ? this.props.value.state : 'UP'
		};

		this.onUp = this.onUp.bind(this);
		this.onDown = this.onDown.bind(this);
		this.onStop = this.onStop.bind(this);
	}

	onUp() {
		const {device} = this.props;
		this.props.onValueChange(device.id, device.supportedMethods, 'UP', null);
		this.setState({state: 'UP'});
	}

	onDown() {
		const {device} = this.props;
		this.props.onValueChange(device.id, device.supportedMethods, 'DOWN', null);
		this.setState({state: 'DOWN'});
	}

	onStop() {
		const {device} = this.props;
		this.props.onValueChange(device.id, device.supportedMethods, 'STOP', null);
		this.setState({state: 'STOP'});
	}

	render() {
		const noop = function () {
		};
		const { UP, DOWN, STOP } = this.props.device.supportedMethods;
		const id = this.props.device.id;

		return (
			<RoundedCornerShadowView style={this.props.style}>
				<UpButton supportedMethod={UP} onPress={UP ? this.onUp : noop} />
				<DownButton supportedMethod={DOWN} onPress={DOWN ? this.onDown : noop} />
				<StopButton supportedMethod={STOP} onPress={STOP ? this.onStop : noop} />
			</RoundedCornerShadowView>
		);
	}
}

NavigationalButton.propTypes = {
	onValueChange: React.PropTypes.func.isRequired
};

const styles = StyleSheet.create({
	navigationButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	enabled: {
		color: '#1a355b',
	},
	disabled: {
		color: '#eeeeee',
	},
});

function mapDispatchToProps(dispatch) {
	return {

	};
}

module.exports = connect(null, mapDispatchToProps)(NavigationalButton);