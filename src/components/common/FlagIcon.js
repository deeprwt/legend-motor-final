import React from 'react';
import {View} from 'react-native';
import WebView from 'react-native-webview';

const FlagIcon = ({url = 'https://example.com/image.svg'}) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;">
        <img src="${url}" style="width:100%;height:100%;" />
      </body>
    </html>
  `;

  return (
    <View style={{height: 16, width: 24}}>
      <WebView
        originWhitelist={['*']}
        source={{html: htmlContent}}
        style={{height: 16, width: 24}}
        scrollEnabled={false}
      />
    </View>
  );
};

export default FlagIcon;
