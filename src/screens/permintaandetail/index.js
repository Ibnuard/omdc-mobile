import {FlatList, ScrollView, StyleSheet, View} from 'react-native';
import React from 'react';
import {
  ActivityIndicator,
  Button,
  Dialog,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import {Card, Container, Gap, Header, InputLabel, Row} from '../../components';
import {Colors, Scaler, Size} from '../../styles';
import {useRoute} from '@react-navigation/native';
import {fetchApi} from '../../api/api';
import {
  BARANG_ADMIN_APPROVAL,
  DETAIL_REQUEST_BARANG,
} from '../../api/apiRoutes';
import {API_STATES} from '../../utils/constant';
import {cekAkses, getDateFormat} from '../../utils/utils';
import {AuthContext} from '../../context';

const PermintaanDetailScreen = () => {
  const route = useRoute();
  const DATA = route?.params?.data;

  const {user} = React.useContext(AuthContext);
  const isAdminPB = cekAkses('#8', user.kodeAkses);

  // state
  const [isLoading, setIsLoading] = React.useState(false);
  const [listBarang, setListBarang] = React.useState();
  const [note, setNote] = React.useState('');
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [mode, setMode] = React.useState();
  const [adminResult, setAdminResult] = React.useState({
    approval_admin_status: DATA.approval_admin_status,
  });
  const [snak, setSnak] = React.useState();

  console.log(DATA);

  const DATA_PERMINTAAN = [
    {
      ti: 'ID Permintaan Barang',
      va: DATA?.id_pb,
    },
    {
      ti: 'Waktu Permintaan',
      va: `${getDateFormat(DATA?.tgl_trans)} | ${DATA?.jam_trans}`,
    },
    {
      ti: 'Cabang',
      va: DATA?.nm_induk,
    },
    {
      ti: 'Kirim Ke',
      va: DATA?.nm_cabang,
    },
    {
      ti: 'Alamat',
      va: DATA?.alamat,
    },
  ];

  React.useEffect(() => {
    getDetailRequested();
  }, []);

  async function getDetailRequested() {
    setIsLoading(true);
    const {state, data, error} = await fetchApi({
      url: DETAIL_REQUEST_BARANG(DATA?.id_pb),
      method: 'GET',
    });

    if (state == API_STATES.OK) {
      setIsLoading(false);
      setListBarang(data);
    } else {
      setIsLoading(false);
      setListBarang([]);
    }
  }

  async function onConfirmAction() {
    setShowConfirm(!showConfirm);
    setIsLoading(true);
    const {state, data, error} = await fetchApi({
      url: BARANG_ADMIN_APPROVAL(DATA.id_pb, mode),
      method: 'POST',
      data: {
        note: note,
      },
    });

    if (state == API_STATES.OK) {
      setIsLoading(false);
      setAdminResult(data);
    } else {
      setIsLoading(false);
      setSnak('Ada sesuatu yang tidak beres, mohon coba lagi!');
    }
  }

  function statusWording() {
    switch (DATA?.status_approve?.toLowerCase()) {
      case 'ditolak':
        return {text: 'Ditolak', color: Colors.COLOR_RED};
        break;
      case 'disetujui sebagian':
        return {text: 'Disetujui Sebagian', color: Colors.COLOR_SECONDARY};
        break;
      case 'disetujui':
        return {text: 'Disetujui', color: Colors.COLOR_GREEN};
        break;
      default:
        return {text: 'Menunggu', color: Colors.COLOR_ORANGE};
        break;
    }
  }

  function pengajuanWording() {
    switch (adminResult?.approval_admin_status?.toLowerCase()) {
      case 'waiting':
        return {
          text: `Menunggu Persetujuan`,
          color: Colors.COLOR_ORANGE,
        };
        break;
      case 'approved':
        return {text: 'Disetujui', color: Colors.COLOR_GREEN};
        break;
      case 'rejected':
        return {text: 'Ditolak', color: Colors.COLOR_RED};
        break;
      default:
        return {
          text: `Menunggu Persetujuan ${DATA.approval_admin_name}`,
          color: Colors.COLOR_ORANGE,
        };
        break;
    }
  }

  function renderStatus() {
    if (DATA.approval_adminid) {
      return (
        <>
          {DATA.approval_admin_status == 'APPROVED' && (
            <>
              <Text style={styles.subtitle} variant="titleSmall">
                Status Approval
              </Text>
              <Gap h={14} />
              <Row>
                <InputLabel style={styles.rowLeft}>Status</InputLabel>
                <Text
                  numberOfLines={5}
                  style={{...styles.textValue, color: statusWording().color}}
                  variant={'labelMedium'}>
                  {statusWording().text}
                </Text>
                <Gap h={6} />
              </Row>
              <Row>
                <InputLabel style={styles.rowLeft}>Tanggal Approval</InputLabel>
                <Text
                  numberOfLines={5}
                  style={styles.textValue}
                  variant={'labelMedium'}>
                  {DATA?.tgl_approve || '-'}
                </Text>
                <Gap h={6} />
              </Row>
              <Gap h={28} />
            </>
          )}
          <Text style={styles.subtitle} variant="titleSmall">
            Status Pengajuan
          </Text>
          <Gap h={14} />
          <Row>
            <InputLabel style={styles.rowLeft}>Status Approval</InputLabel>
            <Text
              numberOfLines={5}
              style={{...styles.textValue, color: pengajuanWording().color}}
              variant={'labelMedium'}>
              {pengajuanWording().text}
            </Text>
            <Gap h={6} />
          </Row>
          <Row>
            <InputLabel style={styles.rowLeft}>Approval by</InputLabel>
            <Text
              numberOfLines={5}
              style={styles.textValue}
              variant={'labelMedium'}>
              {DATA?.approval_admin_name || '-'}
            </Text>
            <Gap h={6} />
          </Row>
          <Row>
            <InputLabel style={styles.rowLeft}>Tanggal Approval</InputLabel>
            <Text
              numberOfLines={5}
              style={styles.textValue}
              variant={'labelMedium'}>
              {adminResult?.approval_admin_date ||
                DATA?.approval_admin_date ||
                '-'}
            </Text>
            <Gap h={6} />
          </Row>
        </>
      );
    }

    return (
      <>
        <Text style={styles.subtitle} variant="titleSmall">
          Status Approval
        </Text>
        <Gap h={14} />
        <Row>
          <InputLabel style={styles.rowLeft}>Status</InputLabel>
          <Text
            numberOfLines={5}
            style={{...styles.textValue, color: statusWording().color}}
            variant={'labelMedium'}>
            {statusWording().text}
          </Text>
          <Gap h={6} />
        </Row>
        <Row>
          <InputLabel style={styles.rowLeft}>Tanggal Approval</InputLabel>
          <Text
            numberOfLines={5}
            style={styles.textValue}
            variant={'labelMedium'}>
            {DATA?.tgl_approve || '-'}
          </Text>
          <Gap h={6} />
        </Row>
      </>
    );
  }

  return (
    <Container>
      <Header title={'Detail Permintaan'} />
      <ScrollView
        style={styles.mainContainer}
        contentContainerStyle={styles.scrollContainer}>
        {renderStatus()}
        <Gap h={28} />
        <Text style={styles.subtitle} variant="titleSmall">
          Data Permintaan
        </Text>
        <Gap h={14} />
        {DATA_PERMINTAAN.map((item, index) => {
          return item?.ti !== 'Alamat' ? (
            <Row key={item + index}>
              <InputLabel style={styles.rowLeft}>{item.ti}</InputLabel>
              <Text
                numberOfLines={5}
                style={styles.textValue}
                variant={'labelMedium'}>
                {item.va}
              </Text>
              <Gap h={6} />
            </Row>
          ) : (
            <View
              style={{
                alignItems: 'flex-start',
                marginBottom: Scaler.scaleSize(6),
              }}
              key={item + index}>
              <InputLabel style={styles.rowLeft}>{item.ti}</InputLabel>
              <Text
                numberOfLines={5}
                style={styles.textValue}
                variant={'labelMedium'}>
                {item.va}
              </Text>
              <Gap h={6} />
            </View>
          );
        })}
        <Gap h={28} />
        <Text style={styles.subtitle} variant="titleSmall">
          Data Barang
        </Text>
        <Gap h={14} />
        {!isLoading && listBarang ? (
          <>
            {listBarang?.map((item, index) => {
              return (
                <Card.BarangCard
                  key={item + index}
                  fromDetail={true}
                  data={item}
                />
              );
            })}
          </>
        ) : (
          <View style={styles.barangLoadingContainer}>
            <ActivityIndicator />
          </View>
        )}
      </ScrollView>
      {isAdminPB ? (
        <View style={styles.bottomBar}>
          {adminResult?.approval_admin_status == 'WAITING' ? (
            <>
              <TextInput
                disabled={isLoading}
                style={styles.inputFull}
                mode={'outlined'}
                placeholder={'Tambahkan catatan'}
                placeholderTextColor={Colors.COLOR_DARK_GRAY}
                onChangeText={text => setNote(text)}
                value={note}
              />
              <Gap h={14} />
              <Button
                mode={'contained'}
                onPress={() => {
                  setMode('ACC');
                  setShowConfirm(!showConfirm);
                }}>
                Setujui
              </Button>
              <Gap h={8} />
              <Button
                mode={'outlined'}
                onPress={() => {
                  setMode('REJ');
                  setShowConfirm(!showConfirm);
                }}>
                Tolak
              </Button>
            </>
          ) : (
            <Button disabled mode={'outlined'}>
              Permintaan telah{' '}
              {adminResult?.approval_admin_status == 'APPROVED'
                ? 'disetujui'
                : 'ditolak'}
            </Button>
          )}
        </View>
      ) : adminResult.approval_admin_status == 'WAITING' ? (
        <View style={styles.bottomBar}>
          <Button
            mode={'contained'}
            onPress={() => {
              setMode('ACC');
              setShowConfirm(!showConfirm);
            }}>
            Batalkan Pengajuan
          </Button>
        </View>
      ) : null}

      <Dialog
        visible={showConfirm}
        onDismiss={() => setShowConfirm(!showConfirm)}>
        <Dialog.Title>Konfirmasi</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Apakah anda yakin ingin {mode == 'ACC' ? 'menyetujui' : 'menolak'}{' '}
            pengajuan ini?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowConfirm(!showConfirm)}>Batalkan</Button>
          <Button onPress={() => onConfirmAction()}>Konfirmasi</Button>
        </Dialog.Actions>
      </Dialog>
      <Snackbar visible={snak} onDismiss={() => setSnak(null)}>
        {snak || ''}
      </Snackbar>
    </Container>
  );
};

export default PermintaanDetailScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.COLOR_WHITE,
    padding: Size.SIZE_14,
  },

  rowLeft: {
    flex: 1,
  },

  barangLoadingContainer: {
    height: Scaler.scaleSize(96),
    justifyContent: 'center',
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Scaler.scaleSize(60),
  },

  bottomBar: {
    backgroundColor: Colors.COLOR_WHITE,
    borderTopWidth: 0.5,
    padding: Size.SIZE_14,
    borderColor: Colors.COLOR_GRAY,
  },

  inputFull: {
    height: Scaler.scaleSize(48),
    backgroundColor: Colors.COLOR_WHITE,
    fontSize: Scaler.scaleFont(14),
  },

  // text

  subtitle: {
    color: Colors.COLOR_PRIMARY,
  },

  textValue: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
  },
});
