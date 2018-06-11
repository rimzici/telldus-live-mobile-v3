package com.telldus.live.mobile;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.os.SystemClock;
import android.text.format.DateUtils;
import android.widget.RemoteViews;
import android.widget.Toast;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import android.util.Log;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.SensorInfo;

/**
 * Implementation of App Widget functionality.
 * App Widget Configuration implemented in {@link NewSensorWidgetConfigureActivity NewSensorWidgetConfigureActivity}
 */
public class NewSensorWidget extends AppWidgetProvider {
    private PendingIntent pendingIntent;
    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId) {

        String iconName="";
        CharSequence widgetText = "Sensor widget";
        String sensorHistory="Last updated 20 mins ago";
        CharSequence sensorValue="22";
        int src=R.drawable.sensor;
        String widgetType;
        MyDBHandler db = new MyDBHandler(context);
        SensorInfo sensorID = db.findSensor(appWidgetId);
        String transparent;
        RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.configurable_sensor_widget);

        if(sensorID!=null) {
            widgetText = sensorID.getWidgetName();
            sensorValue = sensorID.getSensorValue();
            sensorHistory = sensorID.getSensorUpdate();
            widgetType=sensorID.getWidgetType();
            transparent=sensorID.getTransparent();
            if(widgetType.equals("wgust")||widgetType.equals("wavg")||widgetType.equals("wdir"))
            {
                src=R.drawable.wind;
                iconName = "wind";
            }else if(widgetType.equals("watt"))
            {
                src=R.drawable.watt;
                iconName = "watt";
            } else if (widgetType.equals("temp"))
            {
                src=R.drawable.temperature;
                iconName = "temperature";
            }else if(widgetType.equals("humidity"))
            {
                src=R.drawable.humidity;
                iconName = "humidity";
            }else if(widgetType.equals("lum"))
            {
                src=R.drawable.luminance;
                iconName = "luminance";
            }else if(widgetType.equals("rrate")|| widgetType.equals("rtot"))
            {
                src=R.drawable.rain;
                iconName = "rain";
            }else if(widgetType.equals("uv"))
            {
                src=R.drawable.uv;
                iconName = "uv";
            }

            long time = Long.parseLong(sensorHistory);
            //  String timeStamp = GetTimeAgo.getTimeAgo(time, context);
            long now = System.currentTimeMillis();

                if (time < 1000000000000L) {
                    // if timestamp given in seconds, convert to millis
                    time *= 1000;
                }
                /*CharSequence timeSpanString=  DateUtils.getRelativeTimeSpanString(time, now,
                        0L, DateUtils.FORMAT_ABBREV_ALL);
                */

            Date date=new Date(time);
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd hh:mm");


            Log.i("sensorHistory","--->"+formatter.format(date)+"'''''''''''"+date);
            sensorHistory = formatter.format(date);

            //  Toast.makeText(context,sensorHistory,Toast.LENGTH_LONG).show();
            if(transparent.equals("true"))
            {
                view.setInt(R.id.iconWidgetSensor,"setBackgroundColor", Color.TRANSPARENT);
                view.setInt(R.id.linear_background,"setBackgroundColor", Color.TRANSPARENT);

            }
        }


        view.setImageViewBitmap(R.id.iconSensor, buildUpdate(iconName, context));
        view.setTextViewText(R.id.txtSensorType, widgetText);
        view.setTextViewText(R.id.txtHistoryInfo,sensorHistory);
        view.setTextViewText(R.id.txtSensorValue,sensorValue);

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, view);
    }

    public static Bitmap buildUpdate(String time,Context context)
    {
        Bitmap myBitmap = Bitmap.createBitmap(160, 84, Bitmap.Config.ARGB_8888);
        Canvas myCanvas = new Canvas(myBitmap);
        Paint paint = new Paint();
        Typeface iconFont = FontManager.getTypeface(context, FontManager.FONTAWESOME);

        paint.setAntiAlias(true);
        paint.setSubpixelText(true);
        paint.setTypeface(iconFont);
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(Color.WHITE);
        paint.setTextSize(65);
        paint.setTextAlign(Paint.Align.CENTER);
        myCanvas.drawText(time, 30, 70, paint);
        return myBitmap;
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
        PrefManager prefManager=new PrefManager(context);
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
            int count=db.CountSensorTableValues();
            if(count>0)
            {
                Toast.makeText(context,"have data",Toast.LENGTH_LONG).show();

            }else
            {
                Toast.makeText(context,"No sensor",Toast.LENGTH_SHORT).show();
                prefManager.sensorDB(false);
                prefManager.websocketService(false);
                context.stopService(new Intent(context, MyService.class));

            }

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
