import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import MyStyles from "../../../../IT2201CourseApp/ecoursemobileappv1/styles/MyStyles";
import { useEffect, useState } from "react";
import { Chip, List, Searchbar } from "react-native-paper";
import Apis, { endpoints } from "../../../../IT2201CourseApp/ecoursemobileappv1/configs/Apis";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [cateId, setCateId] = useState(null);
    const [kw, setKw] = useState("");
    const nav = useNavigation();

    const loadCates = async () => {
        let res = await Apis.get(endpoints['categories']);
        setCategories(res.data);
    }

    const loadCourses = async () => {
        if (page > 0) {
            try {
                setLoading(true);

                let url = `${endpoints['courses']}?page=${page}`;
                if (kw) {
                    url = `${url}&q=${kw}`;
                }

                if (cateId) {
                    url = `${url}&category_id=${cateId}`;
                }

                let res = await Apis.get(url);

                setCourses([...courses, ...res.data.results]);
                if (res.data.next === null)
                    setPage(0);
            } catch {

            } finally {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        loadCates();
    }, []);

    useEffect(() => {
        let timer = setTimeout(() => {
            loadCourses();
        }, 500);

        return () => clearTimeout(timer);
    }, [kw, page, cateId]);

    const loadMore = () => {
        if (!loading && page > 0)
            setPage(page + 1);
    }

    const search = (value, callback) => {
        setPage(1);
        setCourses([]);
        callback(value);
    }

    return (
        <View style={MyStyles.container}>
            <Text style={MyStyles.subject}>E-COURSE ONLINE</Text>

            <View style={[MyStyles.row, MyStyles.wrap]}>
            <TouchableOpacity onPress={() => search(null, setCateId)}>
                <Chip style={MyStyles.m}  icon="label">Tất cả</Chip>
            </TouchableOpacity>

            {categories.map(c => <TouchableOpacity key={c.id} onPress={() => search(c.id, setCateId)}>
                <Chip style={MyStyles.m}  icon="label">{c.name}</Chip>
            </TouchableOpacity>)}
            </View>

            <Searchbar placeholder="Tìm kiếm khóa học.." onChangeText={t => search(t, setKw)} value={kw} />

            
            <FlatList ListFooterComponent={loading && <ActivityIndicator />} onEndReached={loadMore} data={courses} 
                renderItem={({item}) => <List.Item key={item.id} title={item.subject} description={item.created_date} 
                                                   left={() => <TouchableOpacity onPress={() => nav.navigate("lesson", {"courseId": item.id})}><Image style={MyStyles.avatar} source={{uri: item.image}} /></TouchableOpacity>} />} />
        </View>
    );
}

export default Home;