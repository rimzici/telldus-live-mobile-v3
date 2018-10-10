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

package com.telldus.live.mobile.Model;

public class DeviceInfo {
    String state;
    int widgetID;
    int deviceID;
    String deviceName;
    String transparent;

    public DeviceInfo()
    {

    }

    public DeviceInfo(String state, int widgetID, int deviceID, String deviceName,String transparent) {
        this.state = state;
        this.widgetID = widgetID;
        this.deviceID = deviceID;
        this.deviceName = deviceName;
        this.transparent=transparent;
    }

    public String getState() {
        return state;
    }
    public String getTransparent()
    {
        return transparent;
    }
    public void setTransparent(String transparent)
    {
        this.transparent=transparent;
    }

    public void setState(String state) {
        this.state = state;
    }

    public int getWidgetID() {
        return widgetID;
    }

    public void setWidgetID(int widgetID) {
        this.widgetID = widgetID;
    }

    public int getDeviceID() {
        return deviceID;
    }

    public void setDeviceID(int deviceID) {
        this.deviceID = deviceID;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }
}