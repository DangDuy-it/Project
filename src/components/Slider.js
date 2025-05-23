"use client";
import React, {useEffect, useState} from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import "../styles/Slider.css";
import axios from "axios";
import {useNavigate} from 'react-router-dom';

const AnimeSlider=() => {
    const [sliderData, setSliderData] = useState ([]);
    const navigate= useNavigate();

    useEffect (()=>{
        axios.get("http://localhost:3001/api/slider-movies")
            .then(res => {
                setSliderData(res.data);
            })
            .catch(err=> console.error("Lỗi", err));
    },[]);
    const Settings={
        infinite: true,
        speed: 500,
        slidesToShow:1,
        slidesToScroll:1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
    };
    const handleWatchClick = ( movieId)=>{
        if ( movieId){
            navigate(`/movieDetail/${movieId}`);
        }
        else {
            console.warn(`Không thể chuyển hướng tập phim`);
        }
    };
    return(

        <div className="slider-container">
            <Slider {...Settings}>
                {sliderData.map((slide)=>(
                    <div key={slide.movie_id} className="slide">
                        <div className="slide-info">
                            <h2>{slide.title}</h2>
                            <p>{slide.description}</p>
                            <p><strong>Thể loại:</strong>{slide.genre}</p>
                            <button className="watch-btn" onClick={()=> handleWatchClick(slide.movie_id)}>Xem Phim</button>
                        </div>
                        <div className="slide-background">
                            <img src={slide.background_url} alt={slide.title}  />
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    )
}
export default AnimeSlider;