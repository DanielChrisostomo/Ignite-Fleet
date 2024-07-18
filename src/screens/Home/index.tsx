import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { useQuery, useRealm } from '../../libs/realm';

import { CarStatus } from '../../components/CarStatus';
import { HomeHeader } from '../../components/HomeHeader';

import { Container, Content, Label, Title } from './styles';
import { Historic } from '../../libs/realm/schemas/Historic';
import { Alert, FlatList } from 'react-native';
import { HistoricCard, HistoricCardProps } from '../../components/HistoricCard';
import dayjs from 'dayjs';

export function Home() {
  const [vehicleInUse, setVehicleInUse] = React.useState<Historic | null>(null)
  const [vehicleHistoric, setVehicleHistoric] = React.useState<HistoricCardProps[]>([])

  const { navigate } = useNavigation() 

  const historic = useQuery(Historic)
  const realm = useRealm()

  function handleRegisterMovement() {
    if(vehicleInUse?._id){
      navigate("arrival", { id: vehicleInUse?._id.toString() })
    } else {
      navigate("departure")
    }
  }

  function fetchVehicleInUse() {
    try {
      const vehicle = historic.filtered("status = 'departure'")[0]
      setVehicleInUse(vehicle)
    } catch (error) {
      Alert.alert("Veículo em uso", "Não foi possível carregar o veículo em uso.")
      console.log(error)
    }
  }

  function fetchHistoric(){
    try {

      const response = historic.filtered("status = 'arrival' SORT(created_at DESC)")

      const formattedHistoric = response.map((item) => {
       return ({
         id: item._id!.toString(),
         licensePlate: item.license_plate,
         isSync: false,
         created: dayjs(item.created_at).format("[Saída em] DD/MM/YYYY [ás] HH:mm")
       })
      })
      setVehicleHistoric(formattedHistoric)
      
    } catch (error) {
      console.log(error)
      Alert.alert("Histórico", "Não foi possível carregar o historico.")
    }
  }

  function handleHistoricDetails (id: string) {
    navigate("arrival", { id })
  }

  console.log(vehicleHistoric)

  React.useEffect(() => {
    fetchVehicleInUse()
  }, [])

  React.useEffect(() => {
    realm.addListener("change", () => fetchVehicleInUse())

    return () => {
      if(realm && !realm.isClosed) {
        realm.removeListener("change", fetchVehicleInUse)
      }
    }
  }, [])
  
  React.useEffect(() => {
    fetchHistoric()
  }, [historic])

  return (
    <Container>
      <HomeHeader />

      <Content>
        <CarStatus 
        licensePlate={vehicleInUse?.license_plate}
        onPress={handleRegisterMovement} 
        />

        <Title>
          HIstórico
        </Title>

        <FlatList 
        data={vehicleHistoric}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <HistoricCard 
          data={item} 
          onPress={() => handleHistoricDetails(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 100}}
        ListEmptyComponent={(
          <Label>
            Nenhum veículo utilizado.
          </Label>
        )}
        />

      </Content>
    </Container>
  );
}