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

import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Header, View } from 'BaseComponents';
import Poster from './SubViews/Poster';
import getDeviceWidth from '../../Lib/getDeviceWidth';

import * as scheduleActions from 'Actions_Schedule';
import { getDevices } from 'Actions_Devices';

type Props = {
	navigation: Object,
	children: Object,
	schedule?: Object,
	actions?: Object,
};

type State = {
	h1: string,
	h2: string,
	infoButton: null | Object,
};

export interface ScheduleProps {
	navigation: Object,
	actions: Object,
	onDidMount: (h1: string, h2: string, infoButton: ?Object) => void,
	schedule: Object,
}

class ScheduleScreen extends View<null, Props, State> {

	static propTypes = {
		navigation: PropTypes.object.isRequired,
		children: PropTypes.object.isRequired,
		schedule: PropTypes.object,
		actions: PropTypes.objectOf(PropTypes.func),
	};

	state = {
		h1: '',
		h2: '',
		infoButton: null,
	};

	constructor(props: Props) {
		super(props);

		this.backButton = {
			back: true,
			onPress: this.goBack,
		};
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		const isStateEqual = _.isEqual(this.state, nextState);
		const isPropsEqual = _.isEqual(this.props, nextProps);
		return !(isStateEqual && isPropsEqual);
	}

	goBack = () => {
		this.props.navigation.goBack(null);
	};

	onChildDidMount = (h1: string, h2: string, infoButton?: Object | null = null) => {
		this.setState({
			h1,
			h2,
			infoButton,
		});
	};

	render() {
		const { children, navigation, actions, devices, schedule } = this.props;
		const { h1, h2, infoButton } = this.state;
		const style = this._getStyle();

		return (
			<View>
				<Header leftButton={this.backButton}/>
				<Poster h1={h1} h2={h2} infoButton={infoButton}/>
				<View style={style}>
					{React.cloneElement(
						children,
						{
							onDidMount: this.onChildDidMount,
							navigation,
							actions,
							paddingRight: style.paddingHorizontal,
							devices,
							schedule,
						},
					)}
				</View>
			</View>
		);
	}

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();
		const padding = deviceWidth * 0.033333333;

		return {
			flex: 1,
			paddingHorizontal: padding,
			paddingTop: padding,
		};
	};

}

type mapStateToPropsType = {
	schedule: Object,
	devices: Object,
};

const mapStateToProps = ({ schedule, devices }: mapStateToPropsType): mapStateToPropsType => (
	{
		schedule,
		devices,
	}
);

const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators(scheduleActions, dispatch),
			getDevices: (): Object => dispatch(getDevices()),
		},
	}
);

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleScreen);
