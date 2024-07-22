import React from "react";
import { Alert, FlatList } from "react-native";
import Toast from "react-native-toast-message";
import { CloudArrowUp } from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";

import { Realm } from "@realm/react";
import { useUser } from "@realm/react";
import { useQuery, useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";
import { getLastAsyncTimestamp, saveLastSyncTimestamp } from "../../libs/asyncStorage/syncStorage";

import { HomeHeader } from "../../components/HomeHeader";
import { CarStatus } from "../../components/CarStatus";
import { HistoricCard, HistoricCardProps } from "../../components/HistoricCard";

import { Container, Content, Label, Title } from "./styles";
import { TopMessage } from "../../components/TopMessage";

export function Home() {
  const [vehicleInUse, setVehicleInUse] = React.useState<Historic | null>(null);
  const [vehicleHistoric, setVehicleHistoric] = React.useState<
    HistoricCardProps[]
  >([]);
  const [percetageToSync, setPercentageToSync] = React.useState<string | null>(
    null
  );

  const { navigate } = useNavigation();

  const historic = useQuery(Historic);
  const user = useUser();
  const realm = useRealm();

  function handleRegisterMovement() {
    if (vehicleInUse?._id) {
      navigate("arrival", { id: vehicleInUse?._id.toString() });
    } else {
      navigate("departure");
    }
  }

  function fetchVehicleInUse() {
    try {
      const vehicle = historic.filtered("status = 'departure'")[0];
      setVehicleInUse(vehicle);
    } catch (error) {
      Alert.alert(
        "Veículo em uso",
        "Não foi possível carregar o veículo em uso."
      );
      console.log(error);
    }
  }

  async function fetchHistoric() {
    try {
      const response = historic.filtered(
        "status = 'arrival' SORT(created_at DESC)"
      );

      const lastSync = await getLastAsyncTimestamp();

      const formattedHistoric = response.map((item) => {
        return {
          id: item._id!.toString(),
          licensePlate: item.license_plate,
          isSync: lastSync > item.updated_at!.getTime(),
          created: dayjs(item.created_at).format(
            "[Saída em] DD/MM/YYYY [ás] HH:mm"
          ),
        };
      });
      setVehicleHistoric(formattedHistoric);
    } catch (error) {
      console.log(error);
      Alert.alert("Histórico", "Não foi possível carregar o historico.");
    }
  }

  function handleHistoricDetails(id: string) {
    navigate("arrival", { id });
  }

  async function progressNotification(
    transferred: number,
    transferable: number
  ) {
    const percentage = (transferred / transferable) * 100;

    if (percentage === 100) {
      await saveLastSyncTimestamp();
      await fetchHistoric();
      setPercentageToSync(null);

      Toast.show({
        type: "info",
        text1: "Todos os dados estão sincronizados.",
      });
    }

    if (percentage < 100) {
      setPercentageToSync(`${percentage.toFixed(0)}% sincronizado.`);
    }
  }

  React.useEffect(() => {
    fetchVehicleInUse();
  }, []);

  React.useEffect(() => {
    realm.addListener("change", () => fetchVehicleInUse());

    return () => {
      if (realm && !realm.isClosed) {
        realm.removeListener("change", fetchVehicleInUse);
      }
    };
  }, []);

  React.useEffect(() => {
    fetchHistoric();
  }, [historic]);

  React.useEffect(() => {
    realm.subscriptions.update((mutableSubs, realm) => {
      const historicByUserQuery = realm
        .objects("Historic")
        .filtered(`user_id = '${user!.id}'`);

      mutableSubs.add(historicByUserQuery, { name: "historic_by_user" });
    });
  }, [realm]);

  React.useEffect(() => {
    const syncSession = realm.syncSession;

    if (!syncSession) {
      return;
    }

    syncSession.addProgressNotification(
      Realm.ProgressDirection.Upload,
      Realm.ProgressMode.ReportIndefinitely,
      progressNotification
    );

    return () => {
      syncSession.removeProgressNotification(progressNotification);
    };
  }, []);

  return (
    <Container>
      {percetageToSync && (
        <TopMessage title={percetageToSync} icon={CloudArrowUp} />
      )}

      <HomeHeader />

      <Content>
        <CarStatus
          licensePlate={vehicleInUse?.license_plate}
          onPress={handleRegisterMovement}
        />

        <Title>HIstórico</Title>

        <FlatList
          data={vehicleHistoric}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoricCard
              data={item}
              onPress={() => handleHistoricDetails(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={<Label>Nenhum veículo utilizado.</Label>}
        />
      </Content>
    </Container>
  );
}
