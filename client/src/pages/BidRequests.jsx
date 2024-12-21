import axios from "axios"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../providers/AuthProvider"
import toast from "react-hot-toast"

const BidRequests = () => {
  const {user} = useContext(AuthContext)
  const [bidS, setBids] = useState([])

  console.log(bidS)
  useEffect(() =>{
    getBidsRequests()
     
  },[ ])

  const getBidsRequests = ()=>{
    axios.get(`${import.meta.env.VITE_Api_Url}/bidrequests/${user.email}`)
    .then(({data}) =>{ 
     const  mainDataBids = data.flat()
    setBids(mainDataBids)
   

   }).catch(err => console.log(err))


  }

  const handelAccept =(id,email)=>{
    axios
    .patch(
      `${import.meta.env.VITE_Api_Url}/bids/complete/${id}/${
        email
      }?status=Progress`
    )
     .then((res)=>{
        getBidsRequests()
        toast.success("Bid accepted")
        // setBids(bidS.filter(bid => bid._id!== id))
        console.log(res)
     })

  }
  const handelReject =(id, email)=>{
    axios
    .patch(
      `${import.meta.env.VITE_Api_Url}/bids/complete/${id}/${
        email
      }?status=Rejected`
    )
     .then((res)=>{
        getBidsRequests()
        toast.success("Bid Rejected")   
        // setBids(bidS.filter(bid => bid._id!== id))
        console.log(res)
     })

  }

  return (
    <section className='container px-4 mx-auto my-12'>
      <div className='flex items-center gap-x-3'>
        <h2 className='text-lg font-medium text-gray-800 '>Bid Requests</h2>

        <span className='px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full '>
          {bidS.length} Requests
        </span>
      </div>

      <div className='flex flex-col mt-6'>
        <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
          <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
            <div className='overflow-hidden border border-gray-200  md:rounded-lg'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500'
                    >
                      <div className='flex items-center gap-x-3'>
                        <span>Title</span>
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500'
                    >
                      <div className='flex items-center gap-x-3'>
                        <span>Email</span>
                      </div>
                    </th>

                    <th
                      scope='col'
                      className='px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500'
                    >
                      <span>Deadline</span>
                    </th>

                    <th
                      scope='col'
                      className='px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500'
                    >
                      <button className='flex items-center gap-x-2'>
                        <span>Price</span>
                      </button>
                    </th>

                    <th
                      scope='col'
                      className='px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500'
                    >
                      Category
                    </th>

                    <th
                      scope='col'
                      className='px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500'
                    >
                      Status
                    </th>

                    <th className='px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500'>
                      Actions
                    </th>
                  </tr>
                </thead>
                {bidS.map(({email, price, status,deadline,job_title,category , job_id},index)=>(
                  <tbody key={index} className='bg-white divide-y divide-gray-200 '>
                  <tr>
                    <td className='px-4 py-4 text-sm text-gray-500  whitespace-nowrap'>
                     {job_title}
                    </td>
                    <td className='px-4 py-4 text-sm text-gray-500  whitespace-nowrap'>
                     {email}
                    </td>

                    <td className='px-4 py-4 text-sm text-gray-500  whitespace-nowrap'>
                      { new Date(deadline).toLocaleDateString()}
                    </td>

                    <td className='px-4 py-4 text-sm text-gray-500  whitespace-nowrap'>
                      ${price}
                    </td>
                    <td className='px-4 py-4 text-sm whitespace-nowrap'>
                      <div className='flex items-center gap-x-2'>
                        <p className='px-3 py-1 rounded-full text-blue-500 bg-blue-100/60 text-xs'>
                           {category}
                        </p>
                      </div>
                    </td>
                    <td className='px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap'>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full gap-x-2 
                        ${status === "Rejected"? "bg-red-100/60 text-red-500":''}
                        ${status === "Progress"? "bg-green-100/60 text-green-500":''}
                        
                       ${status === "Complete"? "bg-blue-100/60 text-blue-500":''}
                       ${status === "Pending"? "bg-yellow-100/60 text-yellow-500":''}
                        
                        `}>
                        <span className={`h-1.5 w-1.5 rounded-full 
                           ${status === "Rejected"? " bg-red-500":''}
                           
                           ${status === "Complete"? " bg-blue-500":''}

                           ${status === "Progress"? "  bg-green-500":''}
                           ${status === "Pending"? "  bg-yellow-500":''}
                          
                          `}></span>
                        <h2 className='text-sm font-normal '>{status}</h2>
                      </div>
                    </td>
                    <td className='px-4 py-4 text-sm whitespace-nowrap'>
                      {status === "Complete" ? <p className=" font-semibold text-gray-400 cursor-not-allowed ">Completed!</p>  :
                      <div className='flex items-center gap-x-6'>
                        <button  
                         onClick={()=> handelAccept(job_id, email)}
                        className={` text-gray-500 transition-colors duration-200   hover:text-red-500 ${status === "Progress" || status === "Complete" ? "cursor-not-allowed ":'' } focus:outline-none`}
                        disabled= {status === "Progress" || status === "Complete" ? true : false}
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            strokeWidth='1.5'
                            stroke='currentColor'
                            className='w-5 h-5'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              d='m4.5 12.75 6 6 9-13.5'
                            />
                          </svg>
                        </button>

                        <button onClick={()=>handelReject(job_id, email)} className={`disabled:cursor-not-allowed text-gray-500 transition-colors duration-200   hover:text-yellow-500 focus:outline-none
                         `}
                          disabled= {status === "Rejected"||status === "Complete" ? true : false}
                          >
                            
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            strokeWidth='1.5'
                            stroke='currentColor'
                            className='w-5 h-5'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              d='M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636'
                            />
                          </svg>
                        </button>
                      </div>
                      }
                    </td>
                  </tr>
                </tbody>
                ))}
                
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BidRequests
