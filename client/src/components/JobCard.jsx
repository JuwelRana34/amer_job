/* eslint-disable react/prop-types */

import { Link } from 'react-router-dom'
import LoadingSpinner from './LoadingSpinner'
import { motion } from "motion/react"
const JobCard = ({job}) => {

  
  if (!job) {
     return <LoadingSpinner/>
  }
const {category,deadline,description,_id,min_price,max_price,job_title, bid}=job
  return (
    <Link
      to={`/job/${_id}`}
      className='w-full max-w-sm px-4 py-3 bg-white rounded-md shadow-md hover:scale-[1.05] transition-all'
    >
      <motion.div whileHover={{ scale: 1.1 }}
     whileTap={{ scale: 0.95 }} animate={{
     scale:1.1,
    transition: { duration: 1 }
  }} className='flex items-center justify-between'>
        <span className='text-xs font-semibold text-gray-800 '>
          Deadline:{ new Date(deadline).toLocaleDateString()} 
        </span>
        <span className='px-3 py-1 text-xs text-blue-800 uppercase bg-blue-200 rounded-full '>
          {category}
        </span>
      </motion.div>

      <div>
        <h1 className='mt-2 text-lg font-semibold text-gray-800 '>
         {job_title}
        </h1>

        <p className='mt-2 text-sm text-gray-600 '>
         {description.substring(0, 50)}...
        </p>
        <p className='mt-2 text-sm font-bold text-gray-600 '>
          Range: ${min_price}- ${max_price}
        </p>
        <p className='mt-2 text-sm font-bold text-gray-600 '>Total Bids:{bid.length}</p>
      </div>
    </Link>
  )
}

export default JobCard
