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
import { connect } from 'react-redux';
import { TextInput, KeyboardAvoidingView, Keyboard } from 'react-native';
import { defineMessages, intlShape } from 'react-intl';

import {View, StyleSheet, Dimensions, FloatingButton} from 'BaseComponents';
import { LabelBox } from 'AddNewLocation_SubViews';

import {getGatewayInfo} from 'Actions';

let deviceWidth = Dimensions.get('window').width;

const messages = defineMessages({
	label: {
		id: 'addNewLocation.locationName.label',
		defaultMessage: 'Name',
		description: 'Label for the field Location Name',
	},
	headerTwo: {
		id: 'addNewLocation.locationName.headerTwo',
		defaultMessage: 'Setup your TellStick to start',
		description: 'Secondary header Text for the Location Detected Screen',
	},
	invalidLocationName: {
		id: 'addNewLocation.locationName.invalidLocationName',
		defaultMessage: 'Location name can\'t be empty',
		description: 'Local validation text when Location name field is left empty',
	},
});

type Props = {
	navigation: Object,
	intl: intlShape.isRequired,
	onDidMount: Function,
	actions: Object,
	getGatewayInfo: (uniqueParam: Object, extras: string) => Promise<any>;
}

class LocationName extends View {
	props: Props;

	onLocationNameChange: (string) => void;
	onNameSubmit: () => void;

	keyboardDidShow: () => void;
	keyboardDidHide: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			locationName: '',
			isKeyboardShown: false,
		};

		this.h1 = `2. ${props.intl.formatMessage(messages.label)}`;
		this.h2 = props.intl.formatMessage(messages.headerTwo);
		this.label = props.intl.formatMessage(messages.label);

		this.onLocationNameChange = this.onLocationNameChange.bind(this);
		this.onNameSubmit = this.onNameSubmit.bind(this);

		this.keyboardDidShow = this.keyboardDidShow.bind(this);
		this.keyboardDidHide = this.keyboardDidHide.bind(this);
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
	}

	keyboardDidShow() {
		this.setState({
			isKeyboardShown: true,
		});
	}

	keyboardDidHide() {
		this.setState({
			isKeyboardShown: false,
		});
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'LocationName';
	}

	componentWillUnmount() {
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	onLocationNameChange(locationName) {
		this.setState({
			locationName,
		});
	}

	onNameSubmit() {
		if (this.state.isKeyboardShown) {
			Keyboard.dismiss();
		}
		if (this.state.locationName !== '') {
			let clientInfo = this.props.navigation.state.params.clientInfo;
			clientInfo.name = this.state.locationName;
			if (clientInfo.timezone) {
				this.props.navigation.navigate('TimeZone', {clientInfo});
			} else {
				let uniqueParam = {id: clientInfo.clientId};
				this.props.getGatewayInfo(uniqueParam, 'timezone')
					.then(response => {
						if (response.timezone) {
							clientInfo.timezone = response.timezone;
							clientInfo.autoDetected = true;
							this.props.navigation.navigate('TimeZone', {clientInfo});
						} else {
							this.props.navigation.navigate('TimeZoneContinent', {clientInfo});
						}
					});
			}
		} else {
			let message = this.props.intl.formatMessage(messages.invalidLocationName);
			this.props.actions.showModal(message);
		}
	}

	render() {
		return (
			<View style={{flex: 1}}>
				<KeyboardAvoidingView behavior="padding" contentContainerStyle={{justifyContent: 'center'}}>
					<LabelBox
						containerStyle={{marginBottom: 10}}
						label={this.label}
						showIcon={true}>
						<TextInput
							style={styles.textField}
							onChangeText={this.onLocationNameChange}
							autoCapitalize="none"
							autoCorrect={false}
							autoFocus={true}
							underlineColorAndroid="#e26901"
							defaultValue={this.state.locationName}
						/>
					</LabelBox>
				</KeyboardAvoidingView>
				<View style={styles.fixElevationIssue}>
					<FloatingButton
						buttonStyle={styles.buttonStyle}
						onPress={this.onNameSubmit}
						imageSource={require('../TabViews/img/right-arrow-key.png')}
						showThrobber={false}
					/>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	textField: {
		height: 50,
		width: deviceWidth - 40,
		paddingLeft: 35,
		color: '#A59F9A',
		fontSize: 20,
	},
	buttonStyle: {
		right: deviceWidth * 0.053333333,
		elevation: 10,
		shadowOpacity: 0.99,
	},
	fixElevationIssue: {
		flex: 1,
		borderRadius: 0,
	},
});

function mapDispatchToProps(dispatch) {
	return {
		getGatewayInfo: (uniqueParam: Object, extras: string) => {
			return dispatch(getGatewayInfo(uniqueParam, extras));
		},
		dispatch,
	};
}

export default connect(null, mapDispatchToProps)(LocationName);
