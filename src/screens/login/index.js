import * as React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {Button, Gap} from '../../components';
import {AuthContext} from '../../context';
import {Colors, Scaler, Size} from '../../styles';
import {Icon, Snackbar, Text, TextInput} from 'react-native-paper';
import ASSETS from '../../utils/assetLoader';
import {fetchApi} from '../../api/api';
import {LOGIN} from '../../api/apiRoutes';
import {API_STATES} from '../../utils/constant';
import {useNavigation} from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import packageInfo from '../../../package.json';
import {retrieveData} from '../../utils/store';

const LoginScreen = () => {
  const [userId, setUserId] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const [showSnack, setShowSnack] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState('');

  const [isLoading, setIsLoading] = React.useState(false);

  const [icon, setIcon] = React.useState();

  const {signIn} = React.useContext(AuthContext);

  const passwordRef = React.useRef();

  const navigation = useNavigation();

  React.useEffect(() => {
    loadIcon();
  }, []);

  async function loadIcon() {
    const getIcon = await retrieveData('APP_ICON');
    setIcon(getIcon);
  }

  // API
  const login = async () => {
    const token = await messaging().getToken();

    console.log('TOKENS', token);

    setIsLoading(true);
    // request body
    const body = {
      iduser: userId.toUpperCase(),
      password: password,
      fcmToken: token,
    };

    // request
    const {state, data, error} = await fetchApi({
      url: LOGIN,
      method: 'POST',
      data: body,
    });

    if (state == API_STATES.OK) {
      setIsLoading(false);
      if (data.isProfileComplete) {
        signIn(data);
      } else {
        navigation.navigate('UserComplete', {user: data});
      }
    } else {
      setIsLoading(false);
      setSnackMessage(error);
      setShowSnack(true);
      console.log(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          backgroundColor={Colors.COLOR_WHITE}
          barStyle={'dark-content'}
        />
        <View style={styles.main}>
          <Image
            style={styles.logo}
            source={{uri: `data:image/png;base64,${icon}`}}
            resizeMode={'contain'}
          />
          <TextInput
            editable={!isLoading}
            mode="outlined"
            value={userId}
            placeholder="User ID"
            onChangeText={text => setUserId(text)}
            left={
              <TextInput.Icon icon={'account'} color={Colors.COLOR_DARK_GRAY} />
            }
            returnKeyType="next"
            onSubmitEditing={() => {
              passwordRef.current.focus();
            }}
            blurOnSubmit={false}
          />
          <Gap h={10} />
          <TextInput
            ref={passwordRef}
            editable={!isLoading}
            mode="outlined"
            value={password}
            placeholder="Password"
            secureTextEntry={!showPassword}
            onChangeText={text => setPassword(text)}
            left={
              <TextInput.Icon icon={'lock'} color={Colors.COLOR_DARK_GRAY} />
            }
            right={
              <TextInput.Icon
                icon={!showPassword ? 'eye' : 'eye-off'}
                color={Colors.COLOR_DARK_GRAY}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          <Gap h={32} />
          <Button
            disabled={!userId || !password}
            loading={isLoading}
            onPress={() => login()}>
            Masuk
          </Button>
          <Gap h={16} />
          <Text style={styles.textVersion} variant="labelSmall">
            Version v.{packageInfo.version} - DEV
          </Text>
        </View>
        <Snackbar visible={showSnack} onDismiss={() => setShowSnack(false)}>
          {snackMessage}
        </Snackbar>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.COLOR_WHITE,
  },

  logo: {
    height: Scaler.scaleSize(120),
    width: Scaler.scaleSize(120),
    alignSelf: 'center',
    marginBottom: Scaler.scaleSize(24),
  },

  main: {
    flex: 1,
    padding: Size.SIZE_24,
    justifyContent: 'center',
  },

  // text
  textVersion: {
    textAlign: 'center',
    color: Colors.COLOR_PRIMARY,
  },
});

export default LoginScreen;
