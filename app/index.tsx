import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList, ScrollView } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import axios from "axios";
import { Appearance } from "react-native";
import { Colors } from "@/constants/Colors";
import { BlurView } from "expo-blur";
import RBSheet from "react-native-raw-bottom-sheet";

interface ExchangeRates {
  [key: string]: number;
}

export default function CurrencyConverter() {
  const [amountFrom, setAmountFrom] = useState<string>("0");
  const [amountTo, setAmountTo] = useState<string>("0");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("PKR");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [currencies, setCurrencies] = useState<string[]>([]);
  const refRBSheetFrom = useRef<any>(null);
  const refRBSheetTo = useRef<any>(null);

  useEffect(() => {
    fetchExchangeRates();
    Appearance.setColorScheme("dark");
  }, []);

  useEffect(() => {
    if (amountFrom) {
      convertCurrency(true);
    }
  }, [amountFrom, amountTo, fromCurrency, toCurrency]);

  const fetchExchangeRates = async () => {
    try {
      const response = await axios.get("https://api.exchangerate-api.com/v4/latest/USD");
      setExchangeRates(response.data.rates);
      setCurrencies(Object.keys(response.data.rates));
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  };

  const convertCurrency = (fromInput: boolean) => {
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) return;
    const rateFrom = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
    if (fromInput) {
      setAmountTo((parseFloat(amountFrom) * rateFrom).toFixed(2));
    } else {
      setAmountFrom((parseFloat(amountTo) / rateFrom).toFixed(2));
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmountFrom(amountTo);
    setAmountTo(amountFrom);
  };

  const getFlagUri = (currency = 'USD') => {
    return `https://flagcdn.com/w40/${currency.slice(0, 2).toLowerCase()}.png`
  }

  return (
    <ScrollView contentContainerStyle={styles.mainContainer} keyboardShouldPersistTaps="handled">
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <Image source={require("@/assets/images/cover.png")} style={styles.cover} />
          <Image source={require("@/assets/images/applogo.png")} style={styles.logo} />
          <ThemedText type="title" style={styles.title}>Currency Converter</ThemedText>
        </ThemedView>
        <ThemedView style={styles.content}>
          <View style={{ position: 'absolute', top: -50, width: '100%' }}>
            <BlurView
              style={styles.card}
              intensity={20}
              tint="light"
            >
              <View>
                <ThemedText>
                  From
                </ThemedText>
                <View style={styles.from}>
                  <TouchableOpacity style={styles.picker} onPress={() => refRBSheetFrom.current.open()}>
                    <Image source={{ uri: getFlagUri(fromCurrency) }} style={styles.flag} />
                    <Text style={styles.currencyCode}>{fromCurrency}</Text>
                    <Text style={styles.arrow}>▼</Text>
                  </TouchableOpacity>
                  <TextInput
                    value={amountFrom}
                    onChangeText={(text) => {
                      setAmountFrom(text);
                      if (text === '' || text === '0') {
                        setAmountTo('0');
                      }
                    }}
                    style={styles.input}
                    keyboardAppearance="dark"
                    keyboardType="numeric"
                  />

                  {/* menu */}
                  <RBSheet ref={refRBSheetFrom} height={Dimensions.get('window').height - 100} openDuration={250} customStyles={{ container: styles.sheet }} closeOnPressBack>
                    <FlatList
                      data={currencies}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity style={styles.item} onPress={() => { setFromCurrency(item); refRBSheetFrom.current.close(); }}>
                          <Image source={{ uri: getFlagUri(item) }} style={styles.flag} />
                          <Text style={styles.currencyCode}>{item}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </RBSheet>
                </View>
              </View>
              <View>
                <ThemedText>
                  To
                </ThemedText>
                <View style={styles.from}>
                  <TouchableOpacity style={styles.picker} onPress={() => refRBSheetTo.current.open()}>
                    <Image source={{ uri: getFlagUri(toCurrency) }} style={styles.flag} />
                    <Text style={styles.currencyCode}>{toCurrency}</Text>
                    <Text style={styles.arrow}>▼</Text>
                  </TouchableOpacity>
                  <TextInput value={amountTo} onChangeText={setAmountTo} style={styles.input} keyboardAppearance="dark" keyboardType="numeric" />
                  {/* menu */}
                  <RBSheet ref={refRBSheetTo} height={Dimensions.get('window').height - 100} openDuration={250} customStyles={{ container: styles.sheet }} closeOnPressBack>
                    <FlatList
                      data={currencies}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity style={styles.item} onPress={() => { setToCurrency(item); refRBSheetTo.current.close(); }}>
                          <Image source={{ uri: getFlagUri(item) }} style={styles.flag} />
                          <Text style={styles.currencyCode}>{item}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </RBSheet>
                </View>
              </View>
            </BlurView>
            {Number.parseInt(amountFrom) > 0 && <ThemedView style={styles.result}>
              <ThemedText>
                Result
              </ThemedText>
              <ThemedText style={styles.resultAmount}>
                {amountFrom} {fromCurrency} = {amountTo} {toCurrency}
              </ThemedText>

            </ThemedView>}
          </View>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  container: { flex: 1 },
  cover: {
    width: "100%",
    height: "100%",
    top: 0,
    position: 'absolute'

  },
  logo: {
    alignSelf: "center",
    width: 80,
    height: 80

  },
  title: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "bold",
    color: '#fff'
  },
  header: {
    position: 'relative',
    width: Dimensions.get('window').width,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  content: {
    width: Dimensions.get('window').width,
    alignItems: 'center',
  },
  card: {
    width: '90%',
    padding: 20,
    overflow: 'hidden',
    borderRadius: 10,
    gap: 20,
    borderWidth: 0.5,
    borderColor: '#FFFFFF40',
    marginHorizontal: 'auto',
  },
  from: {
    display: 'flex',
    flexDirection: 'row'
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingVertical: 15,
    borderRadius: 10,
    width: '50%',
    borderWidth: 1,
    borderColor: Colors.dark.tint,
    backgroundColor: '#02052090',
    color: '#fff'
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    width: '50%'
  },
  flag: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  currencyCode: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  arrow: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 10,
  },
  sheet: {
    backgroundColor: "#030920",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a3c",
  },
  result: {
    alignItems: 'center',
    textAlign: 'center',
    gap: 10,
    marginTop: 30
  },
  resultAmount: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: '#fff',
  },
});

