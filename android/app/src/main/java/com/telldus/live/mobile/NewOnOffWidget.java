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

 package com.telldus.live.mobile;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.support.v4.content.ContextCompat;
import android.view.View;
import android.widget.RemoteViews;
import android.os.Handler;
import android.os.Looper;

import com.androidnetworking.error.ANError;

import org.json.JSONObject;

import java.util.Map;
import java.util.Date;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Utility.DevicesUtilities;
import com.telldus.live.mobile.Utility.CommonUtilities;
import com.telldus.live.mobile.API.DevicesAPI;
import com.telldus.live.mobile.API.UserAPI;
import com.telldus.live.mobile.API.OnAPITaskComplete;

import static android.util.TypedValue.COMPLEX_UNIT_SP;

/**
 * Implementation of App Widget functionality.
 * App Widget Configuration implemented in {@link NewOnOffWidgetConfigureActivity NewOnOffWidgetConfigureActivity}
 */
public class NewOnOffWidget extends AppWidgetProvider {
    private static final String ACTION_ON = "ACTION_ON";
    private static final String ACTION_OFF = "ACTION_OFF";
    private static final String ACTION_BELL = "ACTION_BELL";
    private static final String ACTION_PURCHASE_PRO = "ACTION_PURCHASE_PRO";

    private static final String METHOD_ON = "1";
    private static final String METHOD_OFF = "2";
    private static final String METHOD_BELL = "4";

    DevicesAPI deviceAPI = new DevicesAPI();

    Handler handlerResetDeviceStateToNull;
    Runnable runnableResetDeviceStateToNull;
    static void updateAppWidget(
        Context context,
        AppWidgetManager appWidgetManager,
        int appWidgetId
    ) {
        PrefManager prefManager = new PrefManager(context);
        String accessToken = prefManager.getAccessToken();
        // On log out, only prefManager is cleared and not DB, so we do not want device to show back again during the
        // socket update.
        if (accessToken == "") {
            return;
        }

        MyDBHandler db = new MyDBHandler(context);

        DeviceInfo DeviceWidgetInfo = db.findWidgetInfoDevice(appWidgetId);

        if (DeviceWidgetInfo == null) {
            return;
        }

        String userId = DeviceWidgetInfo.getUserId();
        String currentUserId = prefManager.getUserId();
        if (currentUserId == null || userId == null) {
            return;
        }
        Boolean isSameAccount = userId.trim().equals(currentUserId.trim());
        if (!isSameAccount) {

            RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.logged_out);
            String preScript = context.getResources().getString(R.string.reserved_widget_android_message_user_logged_out_one);
            String phraseTwo = context.getResources().getString(R.string.reserved_widget_android_message_user_logged_out_two);
            view.setTextViewText(R.id.loggedOutInfoOne, preScript + ": ");
            view.setTextViewText(R.id.loggedOutInfoEmail, userId);
            view.setTextViewText(R.id.loggedOutInfoTwo, phraseTwo);

            appWidgetManager.updateAppWidget(appWidgetId, view);

            return;
        }

        Integer deviceId = DeviceWidgetInfo.getDeviceId();
        if (deviceId.intValue() == -1) {
            RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.widget_item_removed);
            view.setTextViewText(R.id.widgetItemRemovedInfo, context.getResources().getString(R.string.reserved_widget_android_message_device_not_found));
            view.setImageViewBitmap(R.id.infoIcon, CommonUtilities.buildTelldusIcon(
                "info",
                ContextCompat.getColor(context, R.color.brightRed),
                80,
                95,
                65,
                context));

            appWidgetManager.updateAppWidget(appWidgetId, view);
            return;
        }

        String transparent;
        CharSequence widgetText = DeviceWidgetInfo.getDeviceName();
        String state = DeviceWidgetInfo.getState();
        String methodRequested = DeviceWidgetInfo.getMethodRequested();
        Integer methods = DeviceWidgetInfo.getDeviceMethods();
        String deviceType = DeviceWidgetInfo.getDeviceType();
        Integer isShowingStatus = DeviceWidgetInfo.getIsShowingStatus();

        DevicesUtilities deviceUtils = new DevicesUtilities();
        Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(methods);
        Map<String, String> actionIconSet = deviceUtils.getDeviceActionIcon(deviceType, state, supportedMethods);

        Integer buttonsCount = supportedMethods.size();
        Boolean hasLearn = ((supportedMethods.get("LEARN") != null) && supportedMethods.get("LEARN"));
        if (hasLearn) {
            buttonsCount = buttonsCount - 1;
        }

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.new_on_off_widget);

        int pro = prefManager.getPro();
        long now = new Date().getTime() / 1000;
        Boolean isBasicUser = pro == -1 || pro < now;

        views.setOnClickPendingIntent(R.id.onCover, getPendingSelf(context, ACTION_ON, appWidgetId));
        views.setOnClickPendingIntent(R.id.offCover, getPendingSelf(context, ACTION_OFF, appWidgetId));

        String onActionIcon = actionIconSet.get("TURNON");
        String offActionIcon = actionIconSet.get("TURNOFF");
        // Bell
        if (supportedMethods.get("BELL") != null && supportedMethods.get("BELL")) {

            views.setOnClickPendingIntent(R.id.onCover, getPendingSelf(context, ACTION_BELL, appWidgetId));
            views.setViewVisibility(R.id.offCover, View.GONE);

            views.setViewVisibility(R.id.widget_content_cover, View.VISIBLE);
            views.setViewVisibility(R.id.onCover, View.VISIBLE);
            views.setInt(R.id.onCover, "setBackgroundResource", R.drawable.button_background);
            views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                "bell",
                ContextCompat.getColor(context, R.color.brandSecondary),
                160,
                85,
                85,
                context));

            if (methodRequested != null && isShowingStatus != 1 && state == null && methodRequested.equals("4")) {
                views.setInt(R.id.onCover, "setBackgroundResource", R.drawable.button_background_secondary_fill);
                views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                    "bell",
                    ContextCompat.getColor(context, R.color.white),
                    160,
                    85,
                    85,
                    context));
            }

            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("4")) {
                if (state == null || !state.equals("4")) {
                    views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                        "statusx",
                        ContextCompat.getColor(context, R.color.widgetRed),
                        160,
                        85,
                        85,
                        context));
                } else {
                    views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                        "statuscheck",
                        ContextCompat.getColor(context, R.color.widgetGreen),
                        160,
                        85,
                        85,
                        context));
                }
            }
        }

        Boolean hasOn = ((supportedMethods.get("TURNON") != null) && supportedMethods.get("TURNON"));
        // ON
        if (hasOn) {
            views.setViewVisibility(R.id.widget_content_cover, View.VISIBLE);
            views.setViewVisibility(R.id.onCover, View.VISIBLE);
            views.setInt(R.id.onCover, "setBackgroundResource", R.drawable.shape_right_rounded_corner);
            views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                onActionIcon,
                ContextCompat.getColor(context, R.color.brandSecondary),
                160,
                85,
                85,
                context));

            if (methodRequested != null && isShowingStatus != 1 && state == null && methodRequested.equals("1")) {
                views.setInt(R.id.onCover, "setBackgroundResource", R.drawable.shape_right_rounded_corner_secondary_fill);
                views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                    onActionIcon,
                    ContextCompat.getColor(context, R.color.white),
                    160,
                    85,
                    85,
                    context));
            }

            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("1")) {
                if (state == null || !state.equals("1")) {
                    views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                        "statusx",
                        ContextCompat.getColor(context, R.color.widgetRed),
                        160,
                        85,
                        85,
                        context));
                } else {
                    views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                        "statuscheck",
                        ContextCompat.getColor(context, R.color.widgetGreen),
                        160,
                        85,
                        85,
                        context));
                }
            }
        }

        Boolean hasOff = ((supportedMethods.get("TURNOFF") != null) && supportedMethods.get("TURNOFF"));
        // OFF
        if (hasOff) {
            views.setViewVisibility(R.id.widget_content_cover, View.VISIBLE);
            views.setViewVisibility(R.id.offCover, View.VISIBLE);
            views.setImageViewBitmap(R.id.iconOff, CommonUtilities.buildTelldusIcon(
                offActionIcon,
                ContextCompat.getColor(context, R.color.brandPrimary),
                160,
                85,
                85,
                context));

            views.setInt(R.id.offCover, "setBackgroundResource", R.drawable.shape_left_rounded_corner);

            if (methodRequested != null && isShowingStatus != 1 && state == null && methodRequested.equals("2")) {
                views.setInt(R.id.offCover, "setBackgroundResource", R.drawable.shape_left_rounded_corner_primary_fill);
                views.setImageViewBitmap(R.id.iconOff, CommonUtilities.buildTelldusIcon(
                    offActionIcon,
                    ContextCompat.getColor(context, R.color.white),
                    160,
                    85,
                    85,
                    context));
            }

            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("2")) {
                if (state == null || !state.equals("2")) {
                    views.setImageViewBitmap(R.id.iconOff, CommonUtilities.buildTelldusIcon(
                        "statusx",
                        ContextCompat.getColor(context, R.color.widgetRed),
                        160,
                        85,
                        85,
                        context));
                } else {
                    views.setImageViewBitmap(R.id.iconOff, CommonUtilities.buildTelldusIcon(
                        "statuscheck",
                        ContextCompat.getColor(context, R.color.widgetGreen),
                        160,
                        85,
                        85,
                        context));
                }
            }
        }
        transparent = DeviceWidgetInfo.getTransparent();
        if (transparent.equals("true")) {
            views.setInt(R.id.iconWidget, "setBackgroundColor", Color.TRANSPARENT);
        }

        if (isBasicUser) {
            views.setViewVisibility(R.id.premiumRequiredInfo, View.VISIBLE);
            views.setOnClickPendingIntent(R.id.premiumRequiredInfo, getPendingSelf(context, ACTION_PURCHASE_PRO, appWidgetId));
        } else {
            views.setViewVisibility(R.id.premiumRequiredInfo, View.GONE);
        }

        views.setTextViewText(R.id.txtWidgetTitle, widgetText);
        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static PendingIntent getPendingSelf(Context context, String action, int id) {
        Intent intent = new Intent(context, NewOnOffWidget.class);
        intent.setAction(action);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id);
        return PendingIntent.getBroadcast(context, id, intent, 0);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        // When the user deletes the widget, delete the preference associated with it.
        MyDBHandler db = new MyDBHandler(context);
        PrefManager prefManager = new PrefManager(context);
        for (int appWidgetId : appWidgetIds) {
            boolean b = db.deleteWidgetInfoDevice(appWidgetId);
        }
    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        Bundle extras = intent.getExtras();
        if (extras == null) {
            return;
        }

        int widgetId = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);
        if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            return;
        }

        MyDBHandler db = new MyDBHandler(context);
        DeviceInfo widgetInfo = db.findWidgetInfoDevice(widgetId);
        if (widgetInfo == null) {
            return;
        }

        PrefManager prefManager = new PrefManager(context);
        int pro = prefManager.getPro();
        long now = new Date().getTime() / 1000;
        Boolean isBasicUser = pro == -1 || pro < now;
        if (isBasicUser) {
            if (ACTION_PURCHASE_PRO.equals(intent.getAction())) {
                Intent basicUserActivity = new Intent(context, BasicUserActivity.class);
                context.startActivity(basicUserActivity);
                return;
            }

            updateUserProfile(widgetId, context);
            return;
        }

        Integer methods = widgetInfo.getDeviceMethods();
        int deviceId = widgetInfo.getDeviceId();

        if (ACTION_BELL.equals(intent.getAction()) && methods != 0) {

            db.updateDeviceInfo(METHOD_BELL, null, null, 0, widgetId);
            removeHandlerResetDeviceStateToNull();

            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId);

            createDeviceActionApi(context, deviceId, 4, widgetId, db, "Bell");
        }
        if (ACTION_ON.equals(intent.getAction()) && methods != 0) {

            db.updateDeviceInfo(METHOD_ON, null, null, 0, widgetId);
            removeHandlerResetDeviceStateToNull();

            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId);

            createDeviceActionApi(context, deviceId, 1, widgetId, db, "On");
        }
        if (ACTION_OFF.equals(intent.getAction()) && methods != 0) {
            db.updateDeviceInfo(METHOD_OFF, null, null, 0, widgetId);
            removeHandlerResetDeviceStateToNull();

            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId);

            createDeviceActionApi(context, deviceId, 2, widgetId, db, "Off");
        }
    }

    void createDeviceActionApi(final Context context, final int deviceId, int method, final int widgetId, final MyDBHandler db, final String action) {
        PrefManager prefManager = new PrefManager(context);
        String  accessToken = prefManager.getAccessToken();

        String params = "/device/command?id="+deviceId+"&method="+method+"&value=null";
        deviceAPI.setDeviceState(deviceId, method, 0, widgetId, context, new OnAPITaskComplete() {
            @Override
            public void onSuccess(JSONObject response) {
                String error = response.optString("error");
                if (!error.isEmpty() && error != null) {
                    String noDeviceMessage = "Device \""+deviceId+"\" not found!";
                    if (String.valueOf(error).trim().equalsIgnoreCase(noDeviceMessage.trim())) {
                        db.updateDeviceIdDeviceWidget(-1, widgetId);
                    }
                }
                db.updateIsShowingStatus(1, widgetId);
                resetDeviceStateToNull(deviceId, widgetId, context);

                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                updateAppWidget(context, widgetManager, widgetId);
            }
            @Override
            public void onError(ANError error) {
                db.updateIsShowingStatus(1, widgetId);
                resetDeviceStateToNull(deviceId, widgetId, context);

                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                updateAppWidget(context, widgetManager, widgetId);
            }
        });
    }

    public void resetDeviceStateToNull(final int deviceId, final int widgetId, final Context context) {
        handlerResetDeviceStateToNull = new Handler(Looper.getMainLooper());
        runnableResetDeviceStateToNull = new Runnable() {
            @Override
            public void run() {
                MyDBHandler db = new MyDBHandler(context);
                DeviceInfo widgetInfo = db.findWidgetInfoDevice(widgetId);
                if (widgetInfo != null && widgetInfo.getIsShowingStatus() == 1) {
                    db.updateDeviceInfo(null, null, null, 0, widgetId);
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateAppWidget(context, widgetManager, widgetId);
                }
            }
        };
        handlerResetDeviceStateToNull.postDelayed(runnableResetDeviceStateToNull, 5000);
    }

    public void removeHandlerResetDeviceStateToNull() {
        if (handlerResetDeviceStateToNull != null && runnableResetDeviceStateToNull != null) {
            handlerResetDeviceStateToNull.removeCallbacks(runnableResetDeviceStateToNull);
        }
    }

    public void updateUserProfile(final int widgetId, final Context context) {
        UserAPI userAPI = new UserAPI();
        userAPI.getUserProfile(context, new OnAPITaskComplete() {
            @Override
            public void onSuccess(JSONObject response) {
                WidgetsUpdater wUpdater = new WidgetsUpdater();
                wUpdater.updateAllWidgets(context);
            }
            @Override
            public void onError(ANError error) {
            }
        });
    }
}
