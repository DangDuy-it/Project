"use client";
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import "../styles/Slider.css";
import { DataSlider } from "./Dataslider";

const AnimeSlider=() => {
    const Settings={
        infinite: true,
        speed: 500,
        slidesToShow:1,
        slidesToScroll:1,
        autoPlay: true,
        autoPlaySpeed: 3000,
        arrows: true,
    };
    return(

        <div className="slider-container">
            <Slider {...Settings}>
                {DataSlider.map((slide)=>(
                    <div key={slide.id} className="slide">
                        <div className="slide-info">
                            <h2>{slide.title}</h2>
                            <p>{slide.description}</p>
                            <p><strong>Studio:</strong> {slide.studio}</p>
                            <p><strong>Thể loại:</strong>{slide.genre}</p>
                            <button className="watch-btn">Xem Phim</button>
                        </div>
                        <div className="slide-image">
                            <img src={slide.image} alt={slide.title} />
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    )
}
export default AnimeSlider;