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

package com.telldus.live.mobile.Utility;

import android.app.Activity;
import android.content.Context;
import android.util.Log;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;

import org.json.JSONException;
import org.json.JSONObject;

import com.telldus.live.mobile.Database.PrefManager;

public class AccessToken {
PrefManager prefManager;
    public  void createAccessToken(Context context) {
        prefManager=new PrefManager(context);



        Log.d("&&&&&&&&&&&&&&&&&&&&&&&", "&&&&&&&&&&&&&&&&&&&&&&&&&&");
        AndroidNetworking.post("https://api3.telldus.com/oauth2/accessToken")
                .addHeaders("Content-Type", "application/json")
                .addHeaders("Accpet", "application/json")
                .addBodyParameter("client_id",prefManager.getClientID())
                .addBodyParameter("client_secret",prefManager.getClientSecret())
                .addBodyParameter("grant_type",prefManager.getGrantType())
                .setPriority(Priority.LOW)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {

                        Log.v("jsonResponse",response.toString(5));

                        prefManager.AccessTokenDetails(response.getString("access_token")
                        ,response.getString("expires_in"));



                        } catch (JSONException e) {
                            e.printStackTrace();
                        };
                    }

                    @Override
                    public void onError(ANError anError) {

                    }
                });
    }
}