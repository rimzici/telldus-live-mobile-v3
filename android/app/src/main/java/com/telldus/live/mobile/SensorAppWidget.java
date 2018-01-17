package com.telldus.live.mobile;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;
import android.text.format.DateUtils;
import android.widget.RemoteViews;
import android.widget.Toast;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Model.SensorInfo;
import com.telldus.live.mobile.ServiceBackground.MyService;

/**
 * Implementation of App Widget functionality.
 * App Widget Configuration implemented in {@link SensorAppWidgetConfigureActivity SensorAppWidgetConfigureActivity}
 */
public class SensorAppWidget extends AppWidgetProvider {
    private PendingIntent pendingIntent;
    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId) {


        CharSequence widgetText = "Sensor widget";
        String sensorHistory="Last updated 20 mins ago";
        CharSequence sensorValue="22";
        MyDBHandler db = new MyDBHandler(context);
        SensorInfo sensorID = db.findSensor(appWidgetId);

        if(sensorID!=null) {
            widgetText = sensorID.getWidgetName();
            sensorValue = sensorID.getSensorValue();
            sensorHistory = sensorID.getSensorUpdate();
            long time = Long.parseLong(sensorHistory);
          //  String timeStamp = GetTimeAgo.getTimeAgo(time, context);
            long now = System.currentTimeMillis();

            if(!sensorHistory.equals("1515735980"))
            {
                if (time < 1000000000000L) {
                    // if timestamp given in seconds, convert to millis
                    time *= 1000;
                }

                CharSequence timeSpanString=  DateUtils.getRelativeTimeSpanString(time, now,
                        0L, DateUtils.FORMAT_ABBREV_ALL);
                sensorHistory = "Last updated "+String.valueOf(timeSpanString);
            }else {
                sensorHistory = "Waiting for update..";
            }



          //  Toast.makeText(context,sensorHistory,Toast.LENGTH_LONG).show();
        }


        RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.configurable_sensor_widget);
        view.setTextViewText(R.id.txtSensorType, widgetText);
        view.setTextViewText(R.id.txtHistoryInfo,sensorHistory);
        view.setTextViewText(R.id.txtSensorValue,sensorValue);


        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, view);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
        final AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        final Intent i = new Intent(context, UpdateSensorService.class);

        if (pendingIntent == null) {
            pendingIntent = PendingIntent.getService(context, 0, i, PendingIntent.FLAG_CANCEL_CURRENT);
        }
        manager.setRepeating(AlarmManager.ELAPSED_REALTIME, SystemClock.elapsedRealtime(), 60000, pendingIntent);
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        // When the user deletes the widget, delete the preference associated with it.
        MyDBHandler db = new MyDBHandler(context);
        for (int appWidgetId : appWidgetIds) {
            boolean b=db.deleteSensor(appWidgetId);
            if(b)
            {
                Toast.makeText(context,"Successfully deleted",Toast.LENGTH_LONG).show();
            }else
            {
                Toast.makeText(context,"Widget not created",Toast.LENGTH_LONG).show();
            }
           /* int count=db.CountSensorTableValues();
            if(count>0)
            {
                Toast.makeText(context,"have data",Toast.LENGTH_LONG).show();

            }else
            {
               // context.stopService(new Intent(context, MyService.class));

            }
*/
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
}
