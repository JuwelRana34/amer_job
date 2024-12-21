import axios from "axios";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import { AuthContext } from "../providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../components/LoadingSpinner";
const JobDetails = () => {
  const { id } = useParams();
  const [startDate, setStartDate] = useState(new Date());

  const { user } = useContext(AuthContext);
  const {
    isLoading,
    data:jobdata,
    isError,
    error,
  } = useQuery({
    queryKey: ["allJobs"],
    queryFn: () => {
      return axios
      .get(`${import.meta.env.VITE_Api_Url}/jobDetails/${id}`,{ withCredentials: true })
    },
  });

 

  // useEffect(() => {
  //   const JobDetails = () => {
  //     axios
  //       .get(`${import.meta.env.VITE_Api_Url}/jobDetails/${id}`)
  //       .then(({ data }) => {
  //         setJobData(data);
  //       })
  //       .catch((err) => console.log(err));
  //   };
  //   JobDetails();
  // }, [id]);

  const handelBid = (e) => {
    e.preventDefault();
    const { email, price, comment } = e.target;

    if(jobdata?.data?.Bayerinfo?.email === email.value){
      toast.error("You can't bid on your own job");
      return;
    }

    if (
      new Date(startDate).toLocaleDateString() >
      new Date(jobdata?.data?.deadline).toLocaleDateString()
    ) {
      toast.error("date not right");
      return;
    }

    if (parseInt(price.value) > parseInt(jobdata?.data?.max_price)) {
      toast.error("your price is higher than the max price");
      return;
    }

   
    axios
      .put(`${import.meta.env.VITE_Api_Url}/bids`, {
        email: email.value,
        price: price.value,
        comment: comment.value,
        job_id: id,
        deadline: startDate,
        status: "Pending",
        job_title: jobdata?.data?.job_title,
        category: jobdata?.data?.category
      })
      .then(({data}) => {

        toast.success(`${data.message}`);
        e.target.reset();
      })
      .catch((err) => toast.error(err.response.data));
  };


    if (isLoading) return <LoadingSpinner />; 

    if (isError) return <div>{error.message}</div>;
  return (
    <div className="flex flex-col md:flex-row justify-around gap-5  items-center min-h-[calc(100vh-306px)] md:max-w-screen-xl mx-auto ">
      {/* Job Details */}
      <div className="flex-1  px-4 py-7 bg-white rounded-md shadow-md md:min-h-[350px]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-light text-gray-800 ">
            Deadline: {new Date(jobdata?.data?.deadline).toLocaleDateString()}
          </span>
          <span className="px-4 py-1 text-xs text-blue-800 uppercase bg-blue-200 rounded-full ">
            {jobdata?.data?.category}
          </span>
        </div>

        <div>
          <h1 className="mt-2 text-3xl font-semibold text-gray-800 ">
            {jobdata?.data?.job_title}
          </h1>

          <p className="mt-2 text-lg text-gray-600 ">{jobdata?.data?.description}</p>
          <p className="mt-6 text-sm font-bold text-gray-600 ">
            Buyer Details:
          </p>
          <div className="flex items-center gap-5">
            <div>
              <p className="mt-2 text-sm  text-gray-600 ">
                Name: {jobdata?.data?.Bayerinfo?.name}
              </p>
              <p className="mt-2 text-sm  text-gray-600 ">
                Email:{jobdata?.data?.Bayerinfo?.email}
              </p>
            </div>
            <div className="rounded-full object-cover overflow-hidden w-14 h-14">
              <img src={jobdata?.data?.Bayerinfo?.photourl} alt="" />
            </div>
          </div>
          <p className="mt-6 text-lg font-bold text-gray-600 ">
            Range: ${jobdata?.data?.min_price} - ${jobdata?.data?.max_price}
          </p>
        </div>
      </div>

      {/* Place A Bid Form */}
      <section className="p-6 w-full  bg-white rounded-md shadow-md flex-1 md:min-h-[350px]">
        <h2 className="text-lg font-semibold text-gray-700 capitalize ">
          Place A Bid
        </h2>

        <form onSubmit={handelBid}>
          <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
            <div>
              <label className="text-gray-700 " htmlFor="price">
                Price
              </label>
              <input
                id="price"
                type="text"
                name="price"
                required
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring"
              />
            </div>

            <div>
              <label className="text-gray-700 " htmlFor="emailAddress">
                Email Address
              </label>
              <input
                id="emailAddress"
                type="email"
                name="email"
                defaultValue={user?.email}
                disabled
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring"
              />
            </div>

            <div>
              <label className="text-gray-700 " htmlFor="comment">
                Comment
              </label>
              <input
                id="comment"
                name="comment"
                type="text"
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring"
              />
            </div>
            <div className="flex flex-col gap-2 ">
              <label className="text-gray-700">Deadline</label>

              {/* Date Picker Input Field */}
              <DatePicker
                className="border p-2 rounded-md"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
            >
              Place Bid
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default JobDetails;
