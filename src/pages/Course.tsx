import { useContext, useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import CourseHeader from "../components/CourseHeader/CourseHeader";
import Layout from "../components/Layout/Layout";
import Lessons from "../components/Lessons/Lessons";
import Player from "../components/Player/Player";
import LayoutStyles from "../components/Layout/Layout.module.scss";
import { LessonContext } from "../store/LessonContext";
import { courseReducer, init, Course as CourseType } from "../reducers/courseReducer";
import Loading from "./Loading";
import NotFound from "./NotFound";

const Course = () => {
    const [state, dispatch] = useReducer(courseReducer, init);
    const params = useParams();
    const { lesson } = useContext(LessonContext);

    useEffect(() => {
        let token: { token: string };
        const setCourse = (posts: CourseType) => {
            dispatch({ type: "success", payload: posts });
        };
        const setError = () => {
            dispatch({ type: "error" });
        };
        const fetchCourse = async (url: string, bearerToken: string) => {
            dispatch({ type: "fetch" });
            try {
                const res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${bearerToken}`,
                    },
                });
                if (res.ok) {
                    const json = await res.json();
                    setCourse(json);
                } else if (res.status === 400) {
                    setCourse({} as CourseType);
                } else {
                    setError();
                }
            } catch (err) {
                setError();
            }
        };

        const getToken = async () => {
            try {
                const res = await fetch("https://api.wisey.app/api/v1/auth/anonymous?platform=subscriptions");
                token = await res.json();
                fetchCourse(`https://api.wisey.app/api/v1/core/preview-courses/${params.id}`, token.token);
            } catch (err) {
                setError();
            }
        };
        getToken();
    }, []);

    const loading = state.loading && <Loading />;
    const error = state.error && (
        <Layout>
            <p className={LayoutStyles.info}>Error!</p>
        </Layout>
    );
    const nullInfo = !state.course.title && !state.error && <NotFound />;
    const courseContent = state.course.title && (
        <Layout className={LayoutStyles.course}>
            <CourseHeader
                title={state.course.title}
                description={state.course.description}
                rating={state.course.rating}
                date={state.course.launchDate}
                skills={state.course.meta?.skills}
            />
            <Player
                source={lesson.link || state.course.meta?.courseVideoPreview.link}
                preview={
                    lesson.previewImageLink
                        ? `${lesson.previewImageLink}/lesson-${lesson.order}.webp`
                        : `${state.course.meta?.courseVideoPreview.previewImageLink}/preview.webp`
                }
            />
            <Lessons lessons={state.course.lessons} />
        </Layout>
    );

    return (
        <>
            {loading}
            {error}
            {nullInfo}
            {courseContent}
        </>
    );
};
export default Course;
